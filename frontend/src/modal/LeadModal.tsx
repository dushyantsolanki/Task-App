import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { XInputField } from '@/components/custom/XInputField';
import { Building, Globe, Layers, Mail, MapPin, Minus, Phone, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Lead {
  _id?: string;
  title: string;
  address?: string;
  city: string;
  postalCode?: string;
  state: string;
  countryCode: string;
  website?: string;
  phone?: string;
  categories: string[];
  domain?: string;
  emails: string[];
  phones: string[];
  leadStatus: string;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Lead | null;
  handleAdd: (
    values: Lead,
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
  ) => void;
  handleEdit: (
    values: Lead,
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
  ) => void;
}

const leadStatusOptions: string[] = ['new', 'contacted', 'interested', 'lost', 'follow-up later'];
const LeadModal = ({ isOpen, onClose, initialValues, handleAdd, handleEdit }: ModalFormProps) => {
  const [emailInputs, setEmailInputs] = useState<string[]>(
    Array.isArray(initialValues?.emails) && initialValues.emails.length > 0
      ? initialValues.emails
      : [''],
  );
  const [phoneInputs, setPhoneInputs] = useState<string[]>(
    Array.isArray(initialValues?.phones) && initialValues.phones.length > 0
      ? initialValues.phones
      : [''],
  );
  const [categoryInputs, setCategoryInputs] = useState<string[]>(
    Array.isArray(initialValues?.categories) && initialValues.categories.length > 0
      ? initialValues.categories
      : [''],
  );

  useEffect(() => {
    setEmailInputs(
      Array.isArray(initialValues?.emails) && initialValues.emails.length > 0
        ? initialValues.emails
        : [''],
    );
    setPhoneInputs(
      Array.isArray(initialValues?.phones) && initialValues.phones.length > 0
        ? initialValues.phones
        : [''],
    );
    setCategoryInputs(
      Array.isArray(initialValues?.categories) && initialValues.categories.length > 0
        ? initialValues.categories
        : [''],
    );
  }, [initialValues]);

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      address: initialValues?.address || '',
      city: initialValues?.city || '',
      postalCode: initialValues?.postalCode || '',
      state: initialValues?.state || '',
      countryCode: initialValues?.countryCode || '',
      website: initialValues?.website || '',
      phone: initialValues?.phone || '',
      categories:
        Array.isArray(initialValues?.categories) && initialValues.categories.length > 0
          ? initialValues.categories
          : [''],
      emails:
        Array.isArray(initialValues?.emails) && initialValues.emails.length > 0
          ? initialValues.emails
          : [''],
      phones:
        Array.isArray(initialValues?.phones) && initialValues.phones.length > 0
          ? initialValues.phones
          : [''],
      leadStatus: initialValues?.leadStatus || 'new',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      countryCode: Yup.string().required('Country code is required'),
      website: Yup.string().url('Invalid URL format').optional(),
      phone: Yup.string().required('Phone is required'),
      categories: Yup.array()
        .of(Yup.string().required('Category cannot be empty'))
        .min(1, 'At least one category is required'),
      emails: Yup.array()
        .of(Yup.string().email('Invalid email format').required('Email cannot be empty'))
        .min(1, 'At least one email is required'),
      phones: Yup.array()
        .of(Yup.string().required('Phone cannot be empty'))
        .min(1, 'At least one phone is required'),
      leadStatus: Yup.string()
        .oneOf(leadStatusOptions, 'Invalid lead status')
        .required('Lead status is required'),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!!initialValues) {
        handleEdit(
          {
            ...values,
            emails: values.emails.filter((email) => email.trim() !== ''),
            phones: values.phones.filter((phone) => phone.trim() !== ''),
            categories: values.categories.filter((category) => category.trim() !== ''),
          },
          formik.resetForm,
          onClose,
          formik.setSubmitting,
        );
      } else {
        handleAdd(
          {
            ...values,
            emails: values.emails.filter((email) => email.trim() !== ''),
            phones: values.phones.filter((phone) => phone.trim() !== ''),
            categories: values.categories.filter((category) => category.trim() !== ''),
          },
          formik.resetForm,
          onClose,
          formik.setSubmitting,
        );
      }
    },
  });

  const addField = (field: 'emails' | 'phones' | 'categories') => {
    if (field === 'emails') {
      setEmailInputs([...emailInputs, '']);
      formik.setFieldValue('emails', [...formik.values.emails, '']);
    } else if (field === 'phones') {
      setPhoneInputs([...phoneInputs, '']);
      formik.setFieldValue('phones', [...formik.values.phones, '']);
    } else {
      setCategoryInputs([...categoryInputs, '']);
      formik.setFieldValue('categories', [...formik.values.categories, '']);
    }
  };

  const removeField = (field: 'emails' | 'phones' | 'categories', index: number) => {
    if (field === 'emails') {
      const newEmails = emailInputs.filter((_, i) => i !== index);
      setEmailInputs(newEmails);
      formik.setFieldValue('emails', newEmails);
    } else if (field === 'phones') {
      const newPhones = phoneInputs.filter((_, i) => i !== index);
      setPhoneInputs(newPhones);
      formik.setFieldValue('phones', newPhones);
    } else {
      const newCategories = categoryInputs.filter((_, i) => i !== index);
      setCategoryInputs(newCategories);
      formik.setFieldValue('categories', newCategories);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-h-[85vh] sm:max-w-[85vw] md:max-h-[80vh] md:max-w-[720px] lg:max-w-[960px] [&>button:last-child]:top-2 [&>button:last-child]:right-2">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="text-foreground border-b px-4 py-3 text-base font-medium sm:px-6 sm:py-4">
            {!!initialValues ? 'Edit Lead' : 'Create Lead'}
            <p className="text-muted-foreground mt-1 text-xs font-normal sm:text-sm">
              {!!initialValues
                ? 'Update the lead details below.'
                : 'Create a new lead by filling out the details.'}
            </p>
          </DialogTitle>

          <div className="scrollbar-hide overflow-y-auto">
            <DialogDescription asChild>
              <form
                id="lead-form"
                onSubmit={formik.handleSubmit}
                className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 sm:gap-4 sm:px-6 sm:py-4"
              >
                <XInputField
                  id="title"
                  name="title"
                  label="Title"
                  type="text"
                  icon={<Building className="h-4 w-4 sm:h-5 sm:w-5" />}
                  className="h-10 sm:h-11"
                  placeholder="Task 123"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && (formik.errors.title as string)}
                />
                {/* Select */}
                <XInputField
                  id="city"
                  name="city"
                  label="City"
                  type="text"
                  className="h-10 sm:h-11"
                  icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                  placeholder="New York"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city && (formik.errors.city as string)}
                />
                <XInputField
                  id="postalCode"
                  name="postalCode"
                  label="Postal Code"
                  type="text"
                  className="h-10 sm:h-11"
                  placeholder="10001"
                  icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                  value={formik.values.postalCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.postalCode && (formik.errors.postalCode as string)}
                />
                <XInputField
                  id="state"
                  name="state"
                  label="State"
                  type="text"
                  icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                  className="h-10 sm:h-11"
                  placeholder="NY"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.state && (formik.errors.state as string)}
                />
                <XInputField
                  id="countryCode"
                  name="countryCode"
                  label="Country Code"
                  type="text"
                  className="h-10 sm:h-11"
                  icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                  placeholder="US"
                  value={formik.values.countryCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.countryCode && (formik.errors.countryCode as string)}
                />
                <XInputField
                  id="website"
                  name="website"
                  label="Website"
                  type="text"
                  icon={<Globe className="h-4 w-4 sm:h-5 sm:w-5" />}
                  className="h-10 sm:h-11"
                  placeholder="https://example.com"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.website && (formik.errors.website as string)}
                />
                <XInputField
                  id="phone"
                  name="phone"
                  label="Primary Phone"
                  type="text"
                  className="h-10 sm:h-11"
                  placeholder="+91 9625047836"
                  icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && (formik.errors.phone as string)}
                />

                <div className="flex flex-col">
                  <label htmlFor="leadStatus" className="mb-[4px] text-sm font-medium">
                    Lead Status
                  </label>
                  <Select
                    onValueChange={(value) => formik.setFieldValue('leadStatus', value)}
                    value={formik.values.leadStatus}
                  >
                    <SelectTrigger className="w-full py-[18.7px] sm:py-[20.9px]">
                      <SelectValue placeholder="Select lead status" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatusOptions?.map((option) => (
                        <SelectItem value={option} className="capitalize">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.leadStatus && formik.errors.leadStatus && (
                    <p className="mt-1.5 ml-1 text-sm text-red-500">{formik.errors.leadStatus}</p>
                  )}
                </div>

                {/* Emails */}
                <div className="col-span-1 sm:col-span-2">
                  <div className="mb-2">
                    <XInputField
                      id="address"
                      name="address"
                      label="Address"
                      type="text"
                      className="h-10 sm:h-11"
                      icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
                      placeholder="123 Main St"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.address && (formik.errors.address as string)}
                    />
                  </div>
                  <label className="text-xs font-medium sm:text-sm">Emails</label>
                  {emailInputs.map((email: string, index: number) => (
                    <div key={index} title={email} className="mb-2 flex gap-2">
                      <XInputField
                        id={`emails[${index}]`}
                        name={`emails[${index}]`}
                        type="email"
                        className="mt-1.5 h-10 flex-1 sm:h-11"
                        placeholder="email@example.com"
                        icon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                        value={formik.values.emails[index] || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          (formik.touched.emails as any)?.[index] &&
                          (formik.errors.emails?.[index] as string)
                        }
                      />
                      {emailInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => removeField('emails', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                      {index === emailInputs.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => addField('emails')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Phones */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-medium sm:text-sm">Additional Phones</label>
                  {phoneInputs.map((phone: string, index: number) => (
                    <div key={index} title={phone} className="mb-2 flex gap-2">
                      <XInputField
                        id={`phones[${index}]`}
                        name={`phones[${index}]`}
                        type="text"
                        className="mt-1.5 h-10 flex-1 sm:h-11"
                        placeholder="+91 9625047836"
                        icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                        value={formik.values.phones[index] || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          (formik.touched.phones as any)?.[index] &&
                          (formik.errors.phones?.[index] as string)
                        }
                      />
                      {phoneInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => removeField('phones', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                      {index === phoneInputs.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => addField('phones')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Categories */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs font-medium sm:text-sm">Categories</label>
                  {categoryInputs.map((category: string, index: number) => (
                    <div key={index} title={category} className="mb-2 flex gap-2">
                      <XInputField
                        id={`categories[${index}]`}
                        name={`categories[${index}]`}
                        type="text"
                        className="mt-1.5 h-10 flex-1 sm:h-11"
                        icon={<Layers className="h-4 w-4 sm:h-5 sm:w-5" />}
                        placeholder="Category"
                        value={formik.values.categories[index] || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          (formik.touched.categories as any)?.[index] &&
                          (formik.errors.categories as any)?.[index]
                        }
                      />
                      {categoryInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => removeField('categories', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                      {index === categoryInputs.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 flex h-9 w-9 items-center justify-center rounded-sm sm:h-10 sm:w-10"
                          onClick={() => addField('categories')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </form>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col items-center justify-end gap-2 border-t px-4 py-3 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            form="lead-form"
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
