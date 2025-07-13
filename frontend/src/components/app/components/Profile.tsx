import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
    User,
    Mail,
    Camera,
    Save,
    Eye,
    EyeOff,
    Shield,
    Moon,
    Sun,
    Upload
} from 'lucide-react';

// Types
interface UserProfile {
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    avatar: string;
}

interface ProfileUpdateProps {
    initialData?: Partial<UserProfile>;
    onSubmit: (values: UserProfile) => void;
}

// Validation Schema
const validationSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    currentPassword: Yup.string()
        .when(['newPassword'], {
            is: (newPassword: string) => newPassword && newPassword.length > 0,
            then: (schema) => schema.required('Current password is required to set new password'),
            otherwise: (schema) => schema.notRequired()
        }),
    newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .matches(/(?=.*\d)/, 'Password must contain at least one number')
        .notRequired(),
    confirmPassword: Yup.string()
        .when(['newPassword'], {
            is: (newPassword: string) => newPassword && newPassword.length > 0,
            then: (schema) => schema
                .required('Please confirm your password')
                .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
            otherwise: (schema) => schema.notRequired()
        })
});

// Mock shadcn/ui components (simplified versions)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 pb-4">{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="px-6 pb-6">{children}</div>
);

const Button = ({
    children,
    type = 'button',
    variant = 'default',
    size = 'default',
    disabled = false,
    onClick,
    className = ''
}: {
    children: React.ReactNode;
    type?: 'button' | 'submit';
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
    };

    const sizes = {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8'
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = React.forwardRef<HTMLInputElement, {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
}>(({ type = 'text', className = '', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
));

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
        {children}
    </label>
);

const Profile: React.FC<any> = () => {
    const initialData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: ''
    };
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(initialData.avatar || '');

    const handleProfileSubmit = (values: UserProfile) => {
        console.log('Profile data:', values);
        // Handle form submission here
        alert('Profile updated successfully!');
    };

    const mockData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: ''
    };



    const initialValues: UserProfile = {
        name: initialData.name || '',
        email: initialData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatar: initialData.avatar || ''
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account information and preferences</p>
                            </div>
                        </div>
                        <Button onClick={toggleDarkMode} variant="ghost" size="sm">
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        onSubmit(values);
                        setSubmitting(false);
                    }}
                >
                    {({ errors, touched, isSubmitting, values, setFieldValue, handleSubmit }) => (
                        <div className="space-y-8" data-formik-form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Avatar Section */}
                                <div className="lg:col-span-1">
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile image</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="relative">
                                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                                                        {avatarPreview ? (
                                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="h-16 w-16 text-white" />
                                                        )}
                                                    </div>
                                                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                                                        <Camera className="h-4 w-4" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleAvatarChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">JPG, GIF or PNG. Max size 5MB</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Form Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Personal Information */}
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Personal Information
                                            </h3>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Field name="name">
                                                        {({ field }: any) => (
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                placeholder="Enter your full name"
                                                                className={errors.name && touched.name ? 'border-red-500' : ''}
                                                            />
                                                        )}
                                                    </Field>
                                                    {errors.name && touched.name && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <Field name="email">
                                                        {({ field }: any) => (
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                    {...field}
                                                                    type="email"
                                                                    placeholder="Enter your email"
                                                                    className={`pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                                                                />
                                                            </div>
                                                        )}
                                                    </Field>
                                                    {errors.email && touched.email && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Security Section */}
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                                <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                                Security Settings
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Leave blank if you don't want to change your password</p>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <Field name="currentPassword">
                                                    {({ field }: any) => (
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showCurrentPassword ? 'text' : 'password'}
                                                                placeholder="Enter current password"
                                                                className={errors.currentPassword && touched.currentPassword ? 'border-red-500' : ''}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </Field>
                                                {errors.currentPassword && touched.currentPassword && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="newPassword">New Password</Label>
                                                    <Field name="newPassword">
                                                        {({ field }: any) => (
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type={showNewPassword ? 'text' : 'password'}
                                                                    placeholder="Enter new password"
                                                                    className={errors.newPassword && touched.newPassword ? 'border-red-500' : ''}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Field>
                                                    {errors.newPassword && touched.newPassword && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                    <Field name="confirmPassword">
                                                        {({ field }: any) => (
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                                    placeholder="Confirm new password"
                                                                    className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Field>
                                                    {errors.confirmPassword && touched.confirmPassword && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {values.newPassword && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Password Requirements:</h4>
                                                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                                        <li className={values.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                                                            • At least 8 characters long
                                                        </li>
                                                        <li className={/(?=.*[a-z])/.test(values.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                                            • Contains lowercase letter
                                                        </li>
                                                        <li className={/(?=.*[A-Z])/.test(values.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                                            • Contains uppercase letter
                                                        </li>
                                                        <li className={/(?=.*\d)/.test(values.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                                            • Contains number
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 sm:flex-none"
                                            size="lg"
                                            onClick={() => handleSubmit()}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 sm:flex-none"
                                            size="lg"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
        </div>
    );
};



export default Profile;