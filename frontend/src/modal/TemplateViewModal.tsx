import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Mail, Type } from 'lucide-react';

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
      <DialogContent className="flex max-h-[90vh] w-full max-w-md flex-col gap-0 p-0 sm:max-h-[80vh] sm:max-w-lg md:max-h-[70vh] md:max-w-2xl lg:max-h-[70vh] lg:max-w-2xl [&>button:last-child]:top-4">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            View Template
            <p className="text-foreground text-xs font-normal">View the template details below.</p>
          </DialogTitle>

          <div className="scrollbar-hide overflow-y-auto">
            <DialogDescription asChild>
              <div className="space-y-4 px-6 py-4">
                {/* First Row */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Avatar (mobile: top, desktop: right) */}
                  <div className="order-1 flex justify-center md:order-2 md:justify-end">
                    <Avatar
                      className="h-30 w-30 rounded-lg border"
                      title={template?.createdBy?.name}
                    >
                      <AvatarImage
                        src={
                          template?.createdBy?.avatar?.startsWith('https://')
                            ? template?.createdBy?.avatar
                            : import.meta.env.VITE_IMAGE_BASE_URL + template?.createdBy?.avatar
                        }
                        alt="User"
                      />
                      <AvatarFallback className="rounded-md text-lg">
                        {template?.createdBy?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase() || 'TU'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Left Column: Subject + Template Name */}
                  <div className="order-2 flex flex-col gap-6 md:order-1">
                    <div className="flex items-center gap-2">
                      <Type className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Template Name</p>
                        <p className="text-sm">{template.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Subject</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row: Body */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText className="text-muted-foreground h-5 w-5" />
                    <p className="text-sm font-medium">Body</p>
                  </div>
                  <div className="dark:border-accent/40 rounded-md border p-3 text-sm whitespace-pre-wrap">
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
      </DialogContent>
    </Dialog>
  );
};

export default TemplateViewModal;
