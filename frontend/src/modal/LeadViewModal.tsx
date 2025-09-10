import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Phone, Mail, Tag, Link, AlertCircle, User, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  createdBy: {
    _id: string;
    name: string;
    avatar: string;
  };
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const LeadViewModal = ({ isOpen, onClose, lead }: ViewModalProps) => {
  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-h-[85vh] sm:max-w-[85vw] md:max-h-[80vh] md:max-w-[720px] lg:max-w-[960px] [&>button:last-child]:top-2 [&>button:last-child]:right-2">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="text-foreground border-b px-4 py-3 text-base font-medium sm:px-6 sm:py-4">
            Lead Details
            <p className="text-muted-foreground mt-1 text-xs font-normal sm:text-sm">
              View the details of the lead below.
            </p>
          </DialogTitle>

          <div className="scrollbar-hide overflow-y-auto">
            <DialogDescription asChild>
              <div className="flex flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                {/* First Row - Important Details (Left) and Image (Right) */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  {/* Right: Avatar (but first on mobile) */}
                  <div className="order-first flex justify-center sm:order-last">
                    {lead.createdBy?.name && (
                      <Avatar className="h-32 w-32 rounded-md border sm:h-40 sm:w-40">
                        <AvatarImage
                          src={
                            lead.createdBy.avatar?.startsWith('https://')
                              ? lead.createdBy.avatar
                              : import.meta.env.VITE_IMAGE_BASE_URL + lead.createdBy.avatar
                          }
                          alt={lead.createdBy.name}
                          title={lead.createdBy.name}
                        />
                        <AvatarFallback className="rounded-md border">
                          {lead.createdBy.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Left: Important Details */}
                  <div className="flex flex-1 flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Hash className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-medium sm:text-sm">ID</label>
                        <p className="text-foreground text-xs break-all sm:text-sm">
                          {lead._id || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <User className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-medium sm:text-sm">Name</label>
                        <p className="text-foreground text-xs sm:text-sm">
                          {lead.createdBy?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Tag className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <div className="min-w-0 flex-1">
                        <label className="text-xs font-medium sm:text-sm">Company Title</label>
                        <p className="text-foreground text-xs break-words sm:text-sm">
                          {lead.title || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                    Basic Information
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Link className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Website</label>
                          <p className="text-xs break-all sm:text-sm">
                            {lead.website ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary text-blue-600"
                              >
                                {lead.website}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <AlertCircle className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Status</label>
                          <p className="text-foreground text-xs sm:text-sm">
                            <Badge variant="outline">{lead.leadStatus}</Badge>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Contact Information */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                    Location & Contact Information
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Address</label>
                          <p className="text-foreground text-xs break-words sm:text-sm">
                            {lead.address || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">City</label>
                          <p className="text-foreground text-xs sm:text-sm">{lead.city || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">State</label>
                          <p className="text-foreground text-xs sm:text-sm">
                            {lead.state || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Postal Code</label>
                          <p className="text-foreground text-xs sm:text-sm">
                            {lead.postalCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Globe className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Country Code</label>
                          <p className="text-foreground text-xs sm:text-sm">
                            {lead.countryCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <label className="text-xs font-medium sm:text-sm">Primary Phone</label>
                          <p className="text-foreground text-xs sm:text-sm">
                            {lead.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Arrays */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                      <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <label className="text-xs font-medium sm:text-sm">Email Addresses</label>
                    </div>
                    <div className="pl-6 sm:pl-8">
                      {lead.emails && lead.emails.length > 0 ? (
                        lead.emails.map((email, index) => (
                          <p key={index} className="text-foreground text-xs break-all sm:text-sm">
                            {email}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          No email addresses available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                      <Phone className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                      <label className="text-xs font-medium sm:text-sm">
                        Additional Phone Numbers
                      </label>
                    </div>
                    <div className="pl-6 sm:pl-8">
                      {lead.phones && lead.phones.length > 0 ? (
                        lead.phones.map((phone, index) => (
                          <p key={index} className="text-foreground text-xs sm:text-sm">
                            {phone}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          No additional phone numbers
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Tag className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <label className="text-xs font-medium sm:text-sm">Categories</label>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6 sm:pl-8">
                    {lead.categories && lead.categories.length > 0 ? (
                      lead.categories.map((category, index) => (
                        <Badge variant="outline" key={index}>
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        No categories assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col items-center justify-end gap-2 border-t px-4 py-3 sm:flex-row sm:gap-3 sm:px-6 sm:py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadViewModal;
