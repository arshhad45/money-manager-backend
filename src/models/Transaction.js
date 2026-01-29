import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      enum: ["office", "personal"],
      required: true,
    },
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    occurredAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.virtual("isEditable").get(function () {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 12;
});

export default mongoose.model("Transaction", transactionSchema);

