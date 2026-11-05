import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 1_000_000_000,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

budgetSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id.toString(),
    category: this.category,
    amount: this.amount,
    month: this.month,
  };
};

export const Budget = mongoose.model('Budget', budgetSchema);
