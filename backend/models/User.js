const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      default: 'N/A'
    },
    balance: {
      type: Number,
      default: 1000,
      min: 0
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'fare_manager'],
      default: 'user'
    },
    clerkUserId: {
      type: String,
      sparse: true,
      unique: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Add index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ clerkUserId: 1 });

module.exports = mongoose.model('User', userSchema);
