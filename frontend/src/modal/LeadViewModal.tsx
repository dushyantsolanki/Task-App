import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Phone, Mail, Tag, Star, Calendar, Link, Search, Image as ImageIcon, AlertCircle } from "lucide-react";

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
    location?: {
        lat: number;
        lng: number;
    };
    placeId?: string;
    categories: string[];
    reviewsDistribution?: {
        oneStar: number;
        twoStar: number;
        threeStar: number;
        fourStar: number;
        fiveStar: number;
    };
    scrapedAt?: string;
    url?: string;
    searchPageUrl?: string;
    searchString?: string;
    language?: string;
    isAdvertisement: boolean;
    imageUrl?: string;
    domain?: string;
    emails: string[];
    phones: string[];
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
            <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh] lg:max-h-[70vh] w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl [&>button:last-child]:top-4">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b px-6 py-4 text-base">
                        Lead Details
                        <p className="font-normal text-xs text-foreground">
                            View the details of the lead below.
                        </p>
                    </DialogTitle>

                    <div className="overflow-y-auto scrollbar-hide">
                        <DialogDescription asChild>
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <p className="text-sm">{lead.title || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Address</label>
                                        <p className="text-sm">{lead.address || "N/A"}</p>
                                    </div>
                                </div>

                                {/* City */}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">City</label>
                                        <p className="text-sm">{lead.city || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Postal Code */}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Postal Code</label>
                                        <p className="text-sm">{lead.postalCode || "N/A"}</p>
                                    </div>
                                </div>

                                {/* State */}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">State</label>
                                        <p className="text-sm">{lead.state || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Country Code */}
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Country Code</label>
                                        <p className="text-sm">{lead.countryCode || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Website */}
                                <div className="flex items-center gap-2">
                                    <Link className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Website</label>
                                        <p className="text-sm">
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {lead.website}
                                                </a>
                                            ) : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Primary Phone */}
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Primary Phone</label>
                                        <p className="text-sm">{lead.phone || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Emails */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">Emails</label>
                                    </div>
                                    <div className="mt-2">
                                        {lead.emails && lead.emails.length > 0 ? (
                                            lead.emails.map((email, index) => (
                                                <p key={index} className="text-sm">{email}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm">N/A</p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Phones */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">Additional Phones</label>
                                    </div>
                                    <div className="mt-2">
                                        {lead.phones && lead.phones.length > 0 ? (
                                            lead.phones.map((phone, index) => (
                                                <p key={index} className="text-sm">{phone}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm">N/A</p>
                                        )}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">Categories</label>
                                    </div>
                                    <div className="mt-2">
                                        {lead.categories && lead.categories.length > 0 ? (
                                            lead.categories.map((category, index) => (
                                                <p key={index} className="text-sm">{category}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm">N/A</p>
                                        )}
                                    </div>
                                </div>

                                {/* Reviews Distribution */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">Reviews Distribution</label>
                                    </div>
                                    <div className="mt-2">
                                        {lead.reviewsDistribution ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <p className="text-sm">1 Star: {lead.reviewsDistribution.oneStar || 0}</p>
                                                <p className="text-sm">2 Star: {lead.reviewsDistribution.twoStar || 0}</p>
                                                <p className="text-sm">3 Star: {lead.reviewsDistribution.threeStar || 0}</p>
                                                <p className="text-sm">4 Star: {lead.reviewsDistribution.fourStar || 0}</p>
                                                <p className="text-sm">5 Star: {lead.reviewsDistribution.fiveStar || 0}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm">N/A</p>
                                        )}
                                    </div>
                                </div>

                                {/* Scraped At */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Scraped At</label>
                                        <p className="text-sm">{lead.scrapedAt || "N/A"}</p>
                                    </div>
                                </div>

                                {/* URL */}
                                <div className="flex items-center gap-2">
                                    <Link className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">URL</label>
                                        <p className="text-sm">
                                            {lead.url ? (
                                                <a href={lead.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {lead.url}
                                                </a>
                                            ) : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Search Page URL */}
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Search Page URL</label>
                                        <p className="text-sm">
                                            {lead.searchPageUrl ? (
                                                <a href={lead.searchPageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {lead.searchPageUrl}
                                                </a>
                                            ) : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Search String */}
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Search String</label>
                                        <p className="text-sm">{lead.searchString || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Language</label>
                                        <p className="text-sm">{lead.language || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Is Advertisement */}
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Is Advertisement</label>
                                        <p className="text-sm">{lead.isAdvertisement ? "Yes" : "No"}</p>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Image URL</label>
                                        <p className="text-sm">
                                            {lead.imageUrl ? (
                                                <a href={lead.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {lead.imageUrl}
                                                </a>
                                            ) : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Domain */}
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Domain</label>
                                        <p className="text-sm">{lead.domain || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <label className="text-sm font-medium">Location</label>
                                    </div>
                                    <div className="mt-2">
                                        {lead.location ? (
                                            <p className="text-sm">Lat: {lead.location.lat}, Lng: {lead.location.lng}</p>
                                        ) : (
                                            <p className="text-sm">N/A</p>
                                        )}
                                    </div>
                                </div>

                                {/* Place ID */}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <label className="text-sm font-medium">Place ID</label>
                                        <p className="text-sm">{lead.placeId || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="border-t px-6 py-4 sm:items-center">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LeadViewModal;