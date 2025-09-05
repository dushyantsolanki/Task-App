import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Phone, Mail, Tag, Link, AlertCircle, User, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    status: string;
    createdBy: {
        _id: string;
        name: string;
        avatar: string
    }
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
                        Lead Details
                        <p className="font-normal text-xs sm:text-sm text-muted-foreground mt-1">
                            View the details of the lead below.
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <div
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
                                {/* First Row - Important Details (Left) and Image (Right) */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {/* Right: Avatar (but first on mobile) */}
                                    <div className="order-first sm:order-last flex justify-center">
                                        {lead.createdBy?.name && (
                                            <Avatar className="border rounded-md h-32 w-32 sm:h-40 sm:w-40">
                                                <AvatarImage
                                                    src={
                                                        lead.createdBy.avatar?.startsWith('https://')
                                                            ? lead.createdBy.avatar
                                                            : import.meta.env.VITE_IMAGE_BASE_URL + lead.createdBy.avatar
                                                    }
                                                    alt={lead.createdBy.name}
                                                    title={lead.createdBy.name}
                                                />
                                                <AvatarFallback className="border rounded-md">
                                                    {lead.createdBy.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>

                                    {/* Left: Important Details */}
                                    <div className="flex-1 flex flex-col gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <label className="text-xs sm:text-sm font-medium">ID</label>
                                                <p className="text-xs sm:text-sm text-foreground break-all">{lead._id || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <label className="text-xs sm:text-sm font-medium">Name</label>
                                                <p className="text-xs sm:text-sm text-foreground">{lead.createdBy?.name || "N/A"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <label className="text-xs sm:text-sm font-medium">Company Title</label>
                                                <p className="text-xs sm:text-sm text-foreground break-words">{lead.title || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Basic Information */}
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Basic Information
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Link className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Website</label>
                                                    <p className="text-xs sm:text-sm break-all">
                                                        {lead.website ? (
                                                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-primary">
                                                                {lead.website}
                                                            </a>
                                                        ) : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Status</label>
                                                    <p className="text-xs sm:text-sm text-foreground">
                                                        <Badge variant="outline">{lead.status}</Badge>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location & Contact Information */}
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Location & Contact Information
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Address</label>
                                                    <p className="text-xs sm:text-sm text-foreground break-words">{lead.address || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">City</label>
                                                    <p className="text-xs sm:text-sm text-foreground">{lead.city || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">State</label>
                                                    <p className="text-xs sm:text-sm text-foreground">{lead.state || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Postal Code</label>
                                                    <p className="text-xs sm:text-sm text-foreground">{lead.postalCode || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Country Code</label>
                                                    <p className="text-xs sm:text-sm text-foreground">{lead.countryCode || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <label className="text-xs sm:text-sm font-medium">Primary Phone</label>
                                                    <p className="text-xs sm:text-sm text-foreground">{lead.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Contact Arrays */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                            <label className="text-xs sm:text-sm font-medium">Email Addresses</label>
                                        </div>
                                        <div className="pl-6 sm:pl-8">
                                            {lead.emails && lead.emails.length > 0 ? (
                                                lead.emails.map((email, index) => (
                                                    <p key={index} className="text-xs sm:text-sm text-foreground break-all">{email}</p>
                                                ))
                                            ) : (
                                                <p className="text-xs sm:text-sm text-muted-foreground">No email addresses available</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                            <label className="text-xs sm:text-sm font-medium">Additional Phone Numbers</label>
                                        </div>
                                        <div className="pl-6 sm:pl-8">
                                            {lead.phones && lead.phones.length > 0 ? (
                                                lead.phones.map((phone, index) => (
                                                    <p key={index} className="text-xs sm:text-sm text-foreground">{phone}</p>
                                                ))
                                            ) : (
                                                <p className="text-xs sm:text-sm text-muted-foreground">No additional phone numbers</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3 ">
                                        <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                                        <label className="text-xs sm:text-sm font-medium">Categories</label>
                                    </div>
                                    <div className="pl-6 sm:pl-8 flex flex-wrap gap-2">
                                        {lead.categories && lead.categories.length > 0 ? (
                                            lead.categories.map((category, index) => (
                                                <Badge variant="outline" key={index}>{category}</Badge>
                                            ))
                                        ) : (
                                            <p className="text-xs sm:text-sm text-muted-foreground">No categories assigned</p>
                                        )}
                                    </div>
                                </div>

                            </div>
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
                            className="w-full sm:w-auto"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
};

export default LeadViewModal;