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
import { XInputField } from '@/components/custom/XInputField';
import { FileText, Type, Mail } from 'lucide-react';

interface Template {
  _id?: string;
  name: string;
  subject: string;
  body: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Template | null;
  handleAdd: (
    values: Template,
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
  ) => void;
  handleEdit: (
    values: Template,
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
  ) => void;
}

const TemplateModal = ({
  isOpen,
  onClose,
  initialValues,
  handleEdit,
  handleAdd,
}: TemplateModalProps) => {
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      subject: initialValues?.subject || '',
      body: initialValues?.body || '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Template name is required')
        .trim()
        .min(3, 'Template name must be at least 3 characters'),
      subject: Yup.string()
        .required('Subject is required')
        .min(5, 'Subject must be at least 5 characters'),
      body: Yup.string()
        .required('Body is required')
        .min(10, 'Body must be at least 10 characters'),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      if (!!initialValues) {
        handleEdit(values, formik.resetForm, onClose, formik.setSubmitting);
      } else {
        handleAdd(values, formik.resetForm, onClose, formik.setSubmitting);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-h-[85vh] sm:max-w-[85vw] md:max-h-[80vh] md:max-w-[720px] lg:max-w-[960px] [&>button:last-child]:top-2 [&>button:last-child]:right-2">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="text-foreground border-b px-4 py-3 text-base font-medium sm:px-6 sm:py-4">
            {!!initialValues ? 'Edit Template' : 'Create Template'}
            <p className="text-muted-foreground mt-1 text-xs font-normal sm:text-sm">
              {!!initialValues
                ? 'Update the template details below.'
                : 'Create a new template by filling out the details.'}
            </p>
          </DialogTitle>

          <div className="scrollbar-hide overflow-y-auto">
            <DialogDescription asChild>
              <form
                id="template-form"
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <XInputField
                    id="name"
                    name="name"
                    label="Template Name"
                    type="text"
                    icon={<Type className="h-4 w-4 sm:h-5 sm:w-5" />}
                    className="h-10 flex-1 sm:h-11"
                    placeholder="Welcome Email"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && (formik.errors.name as string)}
                  />
                  <XInputField
                    id="subject"
                    name="subject"
                    label="Subject"
                    type="text"
                    icon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                    className="h-10 flex-1 sm:h-11"
                    placeholder="Welcome to Our Service!"
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.subject && (formik.errors.subject as string)}
                  />
                </div>
                <div className="mt-2 flex flex-col">
                  <label htmlFor="body" className="mb-1.5 text-xs font-medium sm:text-sm">
                    Body
                  </label>
                  <div className="relative">
                    <FileText className="text-muted-foreground absolute top-3 left-3 h-4 w-4 sm:h-5 sm:w-5" />
                    <textarea
                      id="body"
                      name="body"
                      className={`h-48 w-full rounded-md border py-3 pr-4 pl-10 text-xs focus:ring-2 focus:outline-none sm:h-64 sm:text-sm ${formik.touched.body && formik.errors.body ? 'focus:ring-destructive border-red-500 ring-1 ring-red-500' : 'focus:ring-primary'} `}
                      placeholder="Enter the template body here..."
                      value={formik.values.body}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.body && formik.errors.body && (
                      <p className="mt-1.5 ml-1 text-xs text-red-500 sm:text-sm">
                        {formik.errors.body}
                      </p>
                    )}
                  </div>
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
          <Button type="submit" form="template-form" className="w-full sm:w-auto">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
