import mongoose, { Document, Model } from "mongoose";

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    bookingId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
        razorpayOrderId: { type: String, required: true, unique: true },
        razorpayPaymentId: { type: String, unique: true, sparse: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },
        status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    },
    { timestamps: true }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
