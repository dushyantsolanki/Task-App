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
import { MapPin, Globe, Phone, Mail, Tag, Link, AlertCircle, User, Hash, Send, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateToIST } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface Attachment {
  filename: string;
  mimeType?: string;
  contentType?: string;
  size: number;
  attachmentId?: string;
  path?: string;
}

interface Reply {
  from: string;
  subject?: string;
  body?: string;
  receivedAt: Date;
  messageId?: string;
  threadId?: string;
  attachments?: Attachment[];
}

interface OpenEvent {
  timestamp: Date;
  ip?: string;
  country?: string;
}

interface ColdMail {
  _id: string;
  leadId: string;
  templateId: string;
  recipients: string;
  status: 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'failed';
  messageId?: string;
  threadId?: string;
  openedAt?: Date;
  lastOpenedAt?: Date;
  openCount: number;
  opens: OpenEvent[];
  isFalsePositive: boolean;
  replies: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

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
  coldMails?: ColdMail[];
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

// Utility to clean reply lines (remove >, >>>, <<<<<<< etc.)
const cleanReplyLine = (line: string): string => {
  return line.replace(/^[>\s<]+/g, '').trim();
};

// Utility to detect meaningless content (emoji-only or gibberish)
const isMeaninglessContent = (text: string): boolean => {
  const cleanedText = text.replace(/\s/g, '');
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Component}]+$/u;
  if (emojiRegex.test(cleanedText)) return true;

  const words = cleanedText.replace(/[^\w\s]/g, '').split(/\s+/);
  const validWords = words.filter((word) => word.length > 2 && /[aeiou]/i.test(word));
  return validWords.length === 0 && words.length > 0;
};

// Enhanced parseReplyBody to separate main body and quoted text
const parseReplyBody = (body: string | undefined) => {
  if (!body) return { main: 'No content provided', quoted: '', isMeaningless: false };

  // Clean each line to remove ">" and "<<" style arrows
  const cleanedBody = body
    .split('\n')
    .map((line) => cleanReplyLine(line))
    .join('\n');

  // Regex to detect quoted text starting with "On ... wrote:"
  const regex = /(^[\s\S]*?)(?=(^On\s.*wrote:))/m;
  const match = cleanedBody.match(regex);
  const mainBody = match ? match[1].trim() : cleanedBody.trim();
  const quotedBody = match ? cleanedBody.slice(match[1].length).trim() : '';

  return {
    main: mainBody || 'No meaningful content',
    quoted: quotedBody,
    isMeaningless: isMeaninglessContent(mainBody),
  };
};

const LeadViewModal = ({ isOpen, onClose, lead }: ViewModalProps) => {
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [openOpens, setOpenOpens] = useState<Record<string, boolean>>({});

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
                {/* Existing Lead Details */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <div className="order-first flex justify-center sm:order-last">
                    {lead.createdBy ? (
                      <Avatar className="h-32 w-32 rounded-md border sm:h-40 sm:w-40">
                        <AvatarImage
                          src={
                            lead.createdBy.avatar?.startsWith('https://')
                              ? lead.createdBy.avatar
                              : `${import.meta.env.VITE_IMAGE_BASE_URL || ''}${lead.createdBy.avatar}`
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
                    ) : (
                      <Avatar className="h-32 w-32 rounded-md border sm:h-40 sm:w-40">
                        <AvatarFallback className="rounded-md border">N/A</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
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
                          <p className="text-foreground text-xs sm:text-sm capitalize">
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

                {/* Cold Mail History */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                    Cold Mail History
                  </h3>
                  {lead.coldMails && lead.coldMails.length > 0 ? (
                    lead.coldMails.map((mail) => (
                      <div
                        key={mail._id}
                        className="border rounded-md p-3 sm:p-4 flex flex-col gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Send className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                          <div className="min-w-0 flex-1">
                            <label className="text-xs font-medium sm:text-sm">Recipient</label>
                            <p className="text-foreground text-xs break-all sm:text-sm">
                              {mail.recipients || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <AlertCircle className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                              <div className="min-w-0 flex-1">
                                <label className="text-xs font-medium sm:text-sm">Status</label>
                                <p className="text-foreground text-xs sm:text-sm capitalize">
                                  <Badge variant="outline">{mail.status}</Badge>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                              <div className="min-w-0 flex-1">
                                <label className="text-xs font-medium sm:text-sm">Open Count</label>
                                <p className="text-foreground text-xs sm:text-sm">
                                  {mail.openCount || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                              <div className="min-w-0 flex-1">
                                <label className="text-xs font-medium sm:text-sm">First Opened</label>
                                <p className="text-foreground text-xs sm:text-sm">
                                  {mail.openedAt
                                    ? formatDateToIST(mail.openedAt)
                                    : 'Not opened'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <AlertCircle className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                              <div className="min-w-0 flex-1">
                                <label className="text-xs font-medium sm:text-sm">False Positive</label>
                                <p className="text-foreground text-xs sm:text-sm">
                                  {mail.isFalsePositive ? 'Yes' : 'No'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Open Events */}
                        {mail.opens && mail.opens.length > 0 ? (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <Collapsible
                              open={openOpens[mail._id] ?? false}
                              onOpenChange={(open) =>
                                setOpenOpens((prev) => ({
                                  ...prev,
                                  [mail._id]: open,
                                }))
                              }
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 text-xs sm:text-sm font-medium" aria-label="Toggle open events">
                                Open Events ({mail.opens.length})
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 border-l-2 pl-4">
                                <div className="flex flex-col gap-2">
                                  {mail.opens.map((openEvent, index) => (
                                    <div key={index} className="text-xs sm:text-sm">
                                      <p>
                                        <strong>Timestamp:</strong> {formatDateToIST(openEvent.timestamp)}
                                      </p>
                                      <p>
                                        <strong>IP:</strong> {openEvent.ip || 'N/A'}
                                      </p>
                                      <p>
                                        <strong>Country:</strong> {openEvent.country || 'Unknown'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs sm:text-sm">No open events available</p>
                        )}

                        {/* Replies */}
                        {mail.replies && mail.replies.length > 0 ? (
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                              <label className="text-xs font-medium sm:text-sm">Replies</label>
                            </div>
                            <div className="pl-6 sm:pl-8 flex flex-col gap-4">
                              {mail.replies.map((reply, index) => {
                                const { main, quoted, isMeaningless } = parseReplyBody(reply.body);
                                return (
                                  <Collapsible
                                    key={index}
                                    open={openReplies[`${mail._id}-${index}`] ?? !isMeaningless}
                                    onOpenChange={(open) =>
                                      setOpenReplies((prev) => ({
                                        ...prev,
                                        [`${mail._id}-${index}`]: open,
                                      }))
                                    }
                                  >
                                    <CollapsibleTrigger
                                      className="flex items-center gap-2 text-xs sm:text-sm font-medium"
                                      aria-label={`Toggle ${isMeaningless ? 'irrelevant reply' : `reply ${index + 1}`}`}
                                    >
                                      <span>{isMeaningless ? 'Irrelevant Reply' : `Reply ${index + 1}`}</span>
                                      {isMeaningless && (
                                        <Badge variant="destructive" className="text-xs cursor-pointer">
                                          Low Quality
                                        </Badge>
                                      )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 border-l-2 pl-4">
                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs sm:text-sm">
                                          <strong>From:</strong> <span className='text-foreground'> {reply.from} </span>
                                        </p>
                                        <p className="text-xs sm:text-sm">
                                          <strong>Subject:</strong>  <span className='text-foreground'> {reply.subject || 'N/A'} </span>
                                        </p>
                                        <p className="text-xs sm:text-sm">
                                          <strong>Received:</strong>  <span className='text-foreground'> {formatDateToIST(reply.receivedAt)} </span>
                                        </p>
                                        <div className="text-xs sm:text-sm break-all max-h-40 overflow-y-auto">
                                          <strong>Body:</strong>
                                          <div className="mt-1">
                                            <p className={isMeaningless ? 'text-muted-foreground italic' : 'text-foreground'} style={{ whiteSpace: 'pre-line' }}>
                                              {main}
                                            </p>
                                            {quoted && (
                                              <div className="mt-2 border-l-2 border-muted pl-2 text-pink-500/80 dark:text-pink-400/60 text-xs sm:text-sm" style={{ whiteSpace: 'pre-line' }}>
                                                {quoted}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {reply.attachments && reply.attachments.length > 0 && (
                                          <div className="text-xs sm:text-sm">
                                            <strong>Attachments:</strong>
                                            <ul className="mt-1 list-disc pl-5">
                                              {reply.attachments.map((attachment, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                  <span>{attachment.filename} ({(attachment.size / 1024).toFixed(2)} KB)</span>
                                                  {attachment.path && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => window.open(attachment.path, '_blank')}
                                                      aria-label={`Download ${attachment.filename}`}
                                                    >
                                                      <Download className="h-4 w-4 mr-1" />
                                                      Download
                                                    </Button>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs sm:text-sm">No replies available</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      No cold mail history available
                    </p>
                  )}
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