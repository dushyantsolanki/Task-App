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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ITemplates } from '@/pages/Lead';
import { Send } from 'lucide-react';

export interface IColdMail {
    recipient: string;
    template: string;
}

interface ColdMailModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValues?: IColdMail | null;
    handleSendColdMail: (
        values: IColdMail,
        resetForm: () => void,
        onClose: () => void,
        setSubmitting: (bool: boolean) => void,
    ) => void;
    emails: string[],
    templates: ITemplates[]
}

export const ColdMailModal = ({
    isOpen,
    onClose,
    handleSendColdMail,
    emails,
    templates
}: ColdMailModalProps) => {

    const formik = useFormik({
        initialValues: {
            recipient: '',
            template: '',
        },
        validationSchema: Yup.object({
            recipient: Yup.string().required('Recipient is required'),
            template: Yup.string().required('Template is required'),
        }),
        onSubmit: (values) => {
            handleSendColdMail(values, formik.resetForm, onClose, formik.setSubmitting);
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[720px] flex-col gap-0 overflow-hidden rounded-lg p-0">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="text-foreground border-b px-4 py-3 text-base font-medium">
                        Send Cold Mail
                        <p className="text-muted-foreground mt-1 text-xs font-normal">
                            Send a new cold mail by filling out the details.
                        </p>
                    </DialogTitle>

                    <div className="scrollbar-hide overflow-y-auto">
                        <DialogDescription asChild>
                            <form
                                id="cold-mail-form"
                                onSubmit={formik.handleSubmit}
                                className="flex flex-col gap-3 px-4 py-3"
                            >
                                <div className="flex flex-col">
                                    <label htmlFor="recipient" className="mb-1.5 text-xs font-medium sm:text-sm">
                                        Recipient
                                    </label>
                                    <Select
                                        onValueChange={(value) => formik.setFieldValue('recipient', value)}
                                        value={formik.values.recipient}
                                    >
                                        <SelectTrigger className="w-full py-[20px] cursor-pointer">
                                            <SelectValue placeholder="Select Email" />
                                        </SelectTrigger>
                                        <SelectContent >
                                            {emails?.length > 0 ? emails.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            )) : <div className='flex h-10 font-medium text-foreground/40 items-center justify-center'> No Data Found </div>}
                                        </SelectContent>
                                    </Select>
                                    {formik.touched.recipient && formik.errors.recipient && (
                                        <p className="mt-1.5 ml-1 text-xs text-red-500 sm:text-sm">
                                            {formik.errors.recipient}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="template" className="mb-1.5 text-xs font-medium sm:text-sm">
                                        Template
                                    </label>
                                    <Select
                                        onValueChange={(value) => formik.setFieldValue('template', value)}
                                        value={formik.values.template}
                                    >
                                        <SelectTrigger className="w-full py-[20px]">
                                            <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.length > 0 ? templates.map((option) => (
                                                <SelectItem key={option?._id} value={option?._id}>
                                                    {option?.name}
                                                </SelectItem>
                                            )) : <div className='flex h-10 font-medium text-foreground/40 items-center justify-center'> No Data Found </div>}
                                        </SelectContent>
                                    </Select>
                                    {formik.touched.template && formik.errors.template && (
                                        <p className="mt-1.5 ml-1 text-xs text-red-500 sm:text-sm">
                                            {formik.errors.template}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex flex-col items-center justify-end gap-2 border-t px-4 py-3 sm:flex-row sm:gap-3">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="cold-mail-form" className="w-full sm:w-auto" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? <><span className="border-white mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                            Please wait...</> : <div className='flex items-center justify-center gap-2'> <Send /> <h3>Send Mail </h3> </div>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


