import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Template = mongoose.model('Template', TemplateSchema);

export default Template;
