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
import { FileText, Type, Mail, X, Download, Trash2, CloudUpload, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Attachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

interface Template {
  _id?: string;
  name: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
  existingAttachments?: any
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Template | null;
  handleAdd: (
    values: Template,
    files: File[],
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
    setSelectedFiles: (val: any) => void
  ) => void;
  handleEdit: (
    values: Template,
    files: File[],
    resetForm: () => void,
    onClose: () => void,
    setSubmitting: (bool: boolean) => void,
    setSelectedFiles: (val: any) => void
  ) => void;
}

const TemplateModal = ({
  isOpen,
  onClose,
  initialValues,
  handleEdit,
  handleAdd,
}: TemplateModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => { setExistingAttachments(initialValues?.attachments || []) }, [initialValues])

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
        handleEdit({ ...values, existingAttachments: existingAttachments?.length === 0 ? [] : existingAttachments }, selectedFiles, formik.resetForm, onClose, formik.setSubmitting, setSelectedFiles);
      } else {
        handleAdd({ ...values, existingAttachments: existingAttachments?.length === 0 ? [] : existingAttachments }, selectedFiles, formik.resetForm, onClose, formik.setSubmitting, setSelectedFiles);
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not allowed. Only images, PDF, DOC, DOCX, and TXT files are allowed.`);
          return false;
        }

        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`);
          return false;
        }

        return true;
      });

      // Check total files limit (existing + new)
      const totalFiles = existingAttachments.length + selectedFiles.length + validFiles.length;
      if (totalFiles > 5) {
        alert('Maximum 5 attachments allowed.');
        return;
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClose = () => {
    setSelectedFiles(() => []);
    setExistingAttachments(() => []);
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                      className={`h-32 w-full rounded-md border py-3 pr-4 pl-10 text-xs focus:ring-2 focus:outline-none sm:h-40 sm:text-sm ${formik.touched.body && formik.errors.body
                        ? 'focus:ring-destructive border-red-500 ring-1 ring-red-500'
                        : 'focus:ring-primary'
                        }`}
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

                {/* File Attachments Section */}
                <div className="mt-2 flex flex-col">
                  <label className="mb-1.5 text-xs font-medium sm:text-sm">
                    Attachments <span className="text-muted-foreground font-normal">(Max 5 files, 5MB each)</span>
                  </label>

                  {/* File Upload Button */}
                  <div className="mb-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={existingAttachments.length + selectedFiles.length >= 5}
                      className="w-full h-full border-dashed"
                    >
                      {/* <Upload className="mr-2 h-4 w-4" />
                      Select Files */}

                      <div className="flex items-center justify-center flex-col p-2  w-full ">
                        <CloudUpload className='text-primary !w-12 !h-12' />
                        <p className="mb-1 text-sm ">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs">
                          SVG, PNG, JPG, PDF, DOCX
                        </p>
                      </div>

                    </Button>
                  </div>

                  {/* Existing Attachments (Edit mode only) */}
                  {initialValues && existingAttachments.length > 0 && (
                    <div className="mb-3">
                      <div className="space-y-2">
                        {existingAttachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg  border p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg"><Paperclip /></span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate wrap-normal text-xs sm:text-sm font-medium">
                                  {attachment.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url?.startsWith('https://')
                                  ? attachment.url
                                  : import.meta.env.VITE_IMAGE_BASE_URL + attachment.url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExistingAttachment(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">New Files:</p>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between  border rounded-lg p-2 bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs sm:text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col items-center justify-end gap-2 border-t px-4 py-3 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
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