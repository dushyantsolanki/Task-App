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
            <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh] lg:max-h-[70vh] w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl [&>button:last-child]:top-4">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        {!!initialValues ? "Edit Template" : "Create Template"}
                        <p className="font-normal text-xs text-foreground">
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
                                className="px-6 py-4 flex-col gap-4"
                            >
                                <div className="flex gap-4">
                                    <XInputField
                                        id="name"
                                        name="name"
                                        label="Template Name"
                                        type="text"
                                        icon={<Type className="h-5 w-5" />}
                                        className="h-11"
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
                                        icon={<Mail className="h-5 w-5" />}
                                        className="h-11"
                                        placeholder="Welcome to Our Service!"
                                        value={formik.values.subject}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.subject && (formik.errors.subject as string)}
                                    />
                                </div>
                                <div className="flex mt-2 flex-col">
                                    <label htmlFor="body" className="text-sm font-medium mb-1.5">
                                        Body
                                    </label>
                                    <div className="relative">
                                        <FileText className="h-5 w-5 absolute left-3 top-3 text-muted-foreground" />
                                        <textarea
                                            id="body"
                                            name="body"
                                            className={`w-full h-64 pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2  ${formik.touched.body && formik.errors.body ? 'focus:ring-destructive border-red-500 ring-1 ring-red-500' : 'focus:ring-primary'} text-sm`}
                                            placeholder="Enter the template body here..."
                                            value={formik.values.body}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.body && formik.errors.body && (
                                            <p className="ml-1 text-sm text-red-500 mt-1.5">{formik.errors.body}</p>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="template-form">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateModal;