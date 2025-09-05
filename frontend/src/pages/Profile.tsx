import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormik, FormikProvider, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useLocalStorage } from '@reactuses/core';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Calendar, Mail, SendIcon, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { XInputField } from '@/components/custom/XInputField';
import AxiousInstance from '@/helper/AxiousInstance';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhoneInput } from '@/components/custom/PhoneInput';
import PasswordResetForm from '@/form/PasswordRestForm';
import SEO from '@/components/app/components/SEO';

interface Payload {
  firstname: string;
  surname: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  mobileNumber: string;
  avatar?: string | null;
}

const UpdateProfileSchema = Yup.object().shape({
  firstname: Yup.string()
    .required('First name is required')
    .matches(/^\S*$/, 'First name cannot contain spaces'),
  surname: Yup.string()
    .required('Surname is required')
    .matches(/^\S*$/, 'Surname cannot contain spaces'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format'),
  mobileNumber: Yup.string()
    .required('Mobile number is required')
    .matches(/^\+?\d{10,15}$/, 'Mobile number must be 10-15 digits, optionally starting with +'),
  avatar: Yup.mixed().nullable(),
});

export default function UpdateProfileForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [, setValue] = useLocalStorage('email', '');
  const { user, update } = useAuthStore();
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    import.meta.env.VITE_IMAGE_BASE_URL + user?.avatar || null,
  );
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    const formData = new FormData();
    formData.append('avatar', file as any);
    try {
      const response = await AxiousInstance.patch(`/auth/profile/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        formik.setFieldValue('avatar', response.data.imagePath);
        update({ avatar: response.data.imagePath });
        toast.success('Profile image uploaded sucessfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Internal Server Error');
    }
  };

  const handleSendOTP = async () => {
    try {
      const response = await AxiousInstance.post(`/auth/profile/send-otp`, {
        email: formik.values.email,
        surname: formik.values.surname,
      });
      if (response.status === 201) {
        toast.success('OTP sent to your email');
        setIsOTPSent(true);
        setOtpError(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await AxiousInstance.post(`/auth/profile/verify-otp`, {
        email: formik.values.email,
        otp,
      });
      if (response.status === 200) {
        toast.success('OTP verified successfully');
        setIsOTPVerified(true);
        setOtpError(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP';
      setOtpError(errorMessage);
      toast.error(errorMessage);
      console.error('Error verifying OTP:', error);
    }
  };

  const handleUpdateProfile = async (values: Payload) => {
    if (isEmailChanged && !isOTPVerified) {
      toast.error('Please verify your new email before updating the profile');
      return;
    }

    try {
      if (!values.avatar) {
        toast.error('Avatar is required');
        return;
      }

      const response = await AxiousInstance.put(`/auth/profile/${user.id}`, values);

      if (response.status === 200) {
        update(response.data.user);
        toast.success('Profile updated successfully');
        setValue(values.email);
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profile update failed');
      console.error('Error updating profile:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstname: user?.name?.split(' ')[0] || '',
      surname: user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      gender: user?.gender || 'male',
      dateOfBirth: user?.dateOfBirth || '',
      mobileNumber: user?.mobileNumber || '',
      avatar: user?.avatar,
    },
    validationSchema: UpdateProfileSchema,
    onSubmit: handleUpdateProfile,
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    const newEmail = e.target.value;
    setIsEmailChanged(newEmail !== user?.email);
    setIsOTPSent(false);
    setIsOTPVerified(false);
    setOtp('');
    setOtpError(null);
  };

  return (
    <>
      <SEO
        title="TaskMate | Profile Settings"
        description="Manage your personal information, preferences, and account settings in TaskMate."
        url="https://taskmate.dushyantportfolio.store/settings/profile"
        type="profile"
      />

      <div className="bg-background flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-5xl border-none bg-transparent py-0 shadow-none">
          <CardContent className="px-0">
            <FormikProvider value={formik}>
              <Form className={cn('grid grid-cols-1 gap-8 lg:grid-cols-12', className)} {...props}>
                {/* Left Column: Profile Picture + Reset Password */}
                <div className="flex flex-col items-center gap-8 lg:col-span-4">
                  {/* Profile Picture */}
                  <div className="flex w-full flex-col items-center gap-6">
                    <Label className="text-center text-lg font-medium">Profile Picture</Label>
                    <div className="border-border relative h-40 w-40 overflow-hidden rounded-xl border-2">
                      {profilePicPreview ? (
                        <Avatar className="flex h-full w-full items-center justify-center rounded-lg">
                          <AvatarImage
                            src={
                              user.avatar?.startsWith('https://')
                                ? user.avatar
                                : (profilePicPreview as any)
                            }
                            alt={user?.name as any}
                            className="object-contain"
                          />
                          <AvatarFallback className="rounded-lg">
                            {user?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          <User size={60} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="flex w-full items-center justify-center">
                        <span className="bg-primary rounded-md px-2 py-2 text-center text-sm text-white">
                          + New Upload
                        </span>
                      </div>
                      <Input
                        id="profilePicture"
                        name="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePicChange}
                      />
                    </Label>
                    {formik.touched.avatar && formik.errors.avatar && (
                      <p className="text-destructive text-sm">{formik.errors.avatar}</p>
                    )}
                  </div>

                  {/* Reset Password Form */}
                  <div className="w-full">
                    <PasswordResetForm />
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="flex flex-col gap-6 lg:col-span-8">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <XInputField
                      id="firstname"
                      name="firstname"
                      label="First Name"
                      type="text"
                      className="h-11"
                      placeholder="John"
                      icon={<User size={20} />}
                      value={formik.values.firstname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstname && formik.errors.firstname}
                    />
                    <XInputField
                      id="surname"
                      name="surname"
                      label="Surname"
                      type="text"
                      className="h-11"
                      placeholder="Gino"
                      icon={<User size={20} />}
                      value={formik.values.surname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.surname && formik.errors.surname}
                    />
                  </div>

                  {/* Email + OTP */}
                  <div className="space-y-4">
                    <XInputField
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      className="h-11"
                      placeholder="m@example.com"
                      icon={<Mail size={20} />}
                      value={formik.values.email}
                      onChange={handleEmailChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && formik.errors.email}
                      disabled={!(user.authProvider === 'local')}
                    />
                    {isEmailChanged && !isOTPVerified && (
                      <>
                        <Button
                          type="button"
                          className="h-8 cursor-pointer rounded-sm font-semibold transition-colors"
                          onClick={handleSendOTP}
                          disabled={isOTPSent || !!formik.errors.email}
                        >
                          <SendIcon />
                          {isOTPSent ? 'OTP Sent' : 'Send OTP'}
                        </Button>
                        {isOTPSent && (
                          <div className="space-y-2">
                            <XInputField
                              id="otp"
                              name="otp"
                              label="Enter OTP"
                              type="text"
                              className="h-11"
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              error={otpError}
                            />
                            <Button
                              type="button"
                              className="mt-2 h-8 cursor-pointer rounded-sm font-semibold transition-colors"
                              onClick={handleVerifyOTP}
                              disabled={!otp}
                            >
                              Verify OTP
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* DOB */}
                  <XInputField
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    className="h-11"
                    placeholder="YYYY-MM-DD"
                    icon={<Calendar size={20} />}
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  />

                  {/* Phone */}
                  <PhoneInput
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="+91 7620798520"
                    value={formik.values.mobileNumber}
                    onChange={(value) => formik.setFieldValue('mobileNumber', value)}
                    onBlur={formik.handleBlur}
                    error={formik.touched.mobileNumber && formik.errors.mobileNumber}
                  />

                  {/* Gender */}
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formik.values.gender}
                      onValueChange={(value) => formik.setFieldValue('gender', value)}
                    >
                      <SelectTrigger className="w-full py-[21px]">
                        <SelectValue placeholder="Select a gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Gender</SelectLabel>
                          {['male', 'female', 'other'].map((item) => (
                            <SelectItem key={item} value={item}>
                              {item.charAt(0).toUpperCase() + item.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <p className="text-sm text-red-500">{formik.errors.gender}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full rounded-lg font-semibold transition-colors hover:cursor-pointer"
                    disabled={formik.isSubmitting || (isEmailChanged && !isOTPVerified)}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <span className="border-primary-foreground mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
              </Form>
            </FormikProvider>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
