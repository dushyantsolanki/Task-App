import mongoose from 'mongoose';

const calendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    backgroundColor: {
      type: String,
      required: true,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

const Calendar = mongoose.model('Calendar', calendarSchema);

export default Calendar;
