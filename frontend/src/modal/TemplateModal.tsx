import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { XInputField } from "@/components/custom/XInputField";
import { FileText, Type, Mail } from "lucide-react";

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
    handleAdd: (values: Template, resetForm: () => void, onClose: () => void) => void
    handleEdit: (values: Template, resetForm: () => void, onClose: () => void) => void
}

const TemplateModal = ({ isOpen, onClose, initialValues, handleEdit, handleAdd }: TemplateModalProps) => {

    const formik = useFormik({
        initialValues: {
            name: initialValues?.name || "",
            subject: initialValues?.subject || "",
            body: initialValues?.body || "",
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required("Template name is required")
                .trim()
                .min(3, "Template name must be at least 3 characters"),
            subject: Yup.string()
                .required("Subject is required")
                .min(5, "Subject must be at least 5 characters"),
            body: Yup.string()
                .required("Body is required")
                .min(10, "Body must be at least 10 characters"),
        }),
        enableReinitialize: true,
        onSubmit: (values) => {
            if (!!initialValues) {
                handleEdit(values, formik.resetForm, onClose)

            } else {
                handleAdd(values, formik.resetForm, onClose)
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="
          flex
          flex-col
          gap-0
          p-0
          w-[95vw]
          max-w-[90vw]
          sm:max-w-[85vw]
          md:max-w-[720px]
          lg:max-w-[960px]
          max-h-[90vh]
          sm:max-h-[85vh]
          md:max-h-[80vh]
          overflow-hidden
          rounded-lg
          [&>button:last-child]:top-2
          [&>button:last-child]:right-2
        "
            >
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle
                        className="
              border-b
              px-4
              py-3
              sm:px-6
              sm:py-4
              text-base
              font-medium
              text-foreground
            "
                    >
                        {!!initialValues ? "Edit Template" : "Create Template"}
                        <p className="font-normal text-xs sm:text-sm text-muted-foreground mt-1">
                            {!!initialValues
                                ? "Update the template details below."
                                : "Create a new template by filling out the details."}
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <form
                                id="template-form"
                                onSubmit={formik.handleSubmit}
                                className="
                  px-4
                  py-3
                  sm:px-6
                  sm:py-4
                  flex
                  flex-col
                  gap-3
                  sm:gap-4
                "
                            >
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <XInputField
                                        id="name"
                                        name="name"
                                        label="Template Name"
                                        type="text"
                                        icon={<Type className="h-4 w-4 sm:h-5 sm:w-5" />}
                                        className="h-10 sm:h-11 flex-1"
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
                                        className="h-10 sm:h-11 flex-1"
                                        placeholder="Welcome to Our Service!"
                                        value={formik.values.subject}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.subject && (formik.errors.subject as string)}
                                    />
                                </div>
                                <div className="flex flex-col mt-2">
                                    <label htmlFor="body" className="text-xs sm:text-sm font-medium mb-1.5">
                                        Body
                                    </label>
                                    <div className="relative">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-3 text-muted-foreground" />
                                        <textarea
                                            id="body"
                                            name="body"
                                            className={`
                        w-full
                        h-48
                        sm:h-64
                        pl-10
                        pr-4
                        py-3
                        border
                        rounded-md
                        focus:outline-none
                        focus:ring-2
                        text-xs
                        sm:text-sm
                        ${formik.touched.body && formik.errors.body ? 'focus:ring-destructive border-red-500 ring-1 ring-red-500' : 'focus:ring-primary'}
                      `}
                                            placeholder="Enter the template body here..."
                                            value={formik.values.body}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.body && formik.errors.body && (
                                            <p className="ml-1 text-xs sm:text-sm text-red-500 mt-1.5">{formik.errors.body}</p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter
                    className="
            border-t
            px-4
            py-3
            sm:px-6
            sm:py-4
            flex
            flex-col
            sm:flex-row
            gap-2
            sm:gap-3
            justify-end
            items-center
          "
                >
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto h-10 sm:h-11"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        form="template-form"
                        className="w-full sm:w-auto h-10 sm:h-11"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateModal;