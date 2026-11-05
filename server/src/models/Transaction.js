import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000_000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

transactionSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id.toString(),
    type: this.type,
    amount: this.amount,
    category: this.category,
    description: this.description,
    date: this.date,
    createdAt: this.createdAt,
  };
};

export const Transaction = mongoose.model('Transaction', transactionSchema);
