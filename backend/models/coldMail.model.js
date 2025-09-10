import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  from: { type: String, lowercase: true, trim: true },
  subject: { type: String },
  body: { type: String },
  receivedAt: { type: Date, default: Date.now },
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
    messageId: { type: String }, // Gmail-provided sent email message ID
    openedAt: { type: Date }, // First confirmed open (no default)
    lastOpenedAt: { type: Date }, // Most recent open
    openCount: { type: Number, default: 0 }, // Total opens
    opens: [openEventSchema], // Array of open events
    isFalsePositive: { type: Boolean, default: false }, // Flag for suspected false opens
    reply: replySchema, // Store single reply (expandable to array in future)
  },
  { timestamps: true },
);

coldMailSchema.index({ leadId: 1 });
coldMailSchema.index({ status: 1 });

const ColdMail = mongoose.model('coldMail', coldMailSchema);

export default ColdMail;
