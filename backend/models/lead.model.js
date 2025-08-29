import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'At least one category is required',
      },
    },
    domain: {
      type: String,
      trim: true,
    },
    emails: {
      type: [String],
      validate: [
        {
          validator: function (arr) {
            return arr && arr.length > 0;
          },
          message: 'At least one email is required',
        },
        {
          validator: function (arr) {
            return arr.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
          },
          message: 'Invalid email format',
        },
      ],
    },
    phones: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'At least one phone is required',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'pending'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Lead = mongoose.model('Lead', LeadSchema);

export default Lead;
