import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ['female', 'male'],
      required: function () {
        return this.authProvider === 'local';
      },
    },
    mobileNumber: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      trim: true,
    },
    password: {
      type: String,
      select: false,
      trim: true,
      required: function () {
        return this.authProvider === 'local';
      },
    },
    avatar: { type: String },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    oauthId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      ref: 'Role',
      default: 'member',
    },
    refreshToken: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: [String],
      default: [],
    },
    otp: {
      type: String,
      select: false,
    },
    otpPurpose: {
      type: String,
      enum: ['verify_account', 'forgot_password'],
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
