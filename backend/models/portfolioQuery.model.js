import mongoose from 'mongoose';

const portfolioQuerySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    email: { type: String, required: true, maxlength: 300, trim: true },
    message: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const PortfolioQuery = mongoose.model('PortfolioQuery', portfolioQuerySchema);

export default PortfolioQuery;
