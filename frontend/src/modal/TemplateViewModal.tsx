import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Mail, Type } from "lucide-react";



interface Template {
    _id?: string;
    name: string;
    subject: string;
    body: string;
    createdBy?: {
        _id: string;
        avatar?: string;
        name?: string;
    };
}

interface TemplateViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
}

const TemplateViewModal = ({ isOpen, onClose, template }: TemplateViewModalProps) => {
    if (!template) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh] lg:max-h-[70vh] w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-2xl [&>button:last-child]:top-4">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base ">
                        View Template
                        <p className="font-normal text-xs text-foreground">
                            View the template details below.
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <div className="px-6 py-4 space-y-4">
                                {/* First Row */}
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    {/* Avatar (mobile: top, desktop: right) */}
                                    <div className="order-1 md:order-2 flex justify-center md:justify-end">
                                        <Avatar className="h-30 w-30 border rounded-lg" title={template?.createdBy?.name}>
                                            <AvatarImage src={template?.createdBy?.avatar?.startsWith('https://') ? template?.createdBy?.avatar : import.meta.env.VITE_IMAGE_BASE_URL + template?.createdBy?.avatar} alt="User" />
                                            <AvatarFallback className="rounded-md text-lg">
                                                {template?.createdBy?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TU'}
                                            </AvatarFallback>
                                        </Avatar>

                                    </div>

                                    {/* Left Column: Subject + Template Name */}
                                    <div className="order-2 md:order-1 flex flex-col gap-6">
                                        <div className="flex items-center gap-2">
                                            <Type className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Template Name</p>
                                                <p className="text-sm">{template.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Subject</p>
                                                <p className="text-sm">{template.subject}</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Second Row: Body */}
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm font-medium">Body</p>
                                    </div>
                                    <div className="border dark:border-accent/40 rounded-md p-3 text-sm whitespace-pre-wrap">
                                        {template.body}
                                    </div>
                                </div>
                            </div>


                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
};

export default TemplateViewModal;