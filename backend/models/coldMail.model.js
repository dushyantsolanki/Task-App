import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  attachmentId: { type: String }, // Useful if you want to refetch
  path: { type: String }, // Local storage path of file that are save in server
});

const replySchema = new mongoose.Schema({
  from: { type: String, lowercase: true, trim: true },
  subject: { type: String },
  body: { type: String },
  receivedAt: { type: Date, default: Date.now },
  messageId: { type: String },
  threadId: { type: String },
  attachments: [attachmentSchema],
});

const openEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  country: { type: String },
});

const coldMailSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
    recipients: { type: String, lowercase: true, trim: true, required: true },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'replied'],
      default: 'sent',
    },
    messageId: { type: String }, // original Gmail messageId
    threadId: { type: String }, // track full Gmail thread
    openedAt: { type: Date },
    lastOpenedAt: { type: Date },
    openCount: { type: Number, default: 0 },
    opens: [openEventSchema],
    isFalsePositive: { type: Boolean, default: false },
    replies: [replySchema],
  },
  { timestamps: true },
);

coldMailSchema.index({ leadId: 1 });
coldMailSchema.index({ status: 1 });

const ColdMail = mongoose.model('coldMail', coldMailSchema);

export default ColdMail;
