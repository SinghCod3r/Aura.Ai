import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    email: string;
    name?: string;
    image?: string;
    role: "STUDENT" | "MENTOR" | "ADMIN" | "SUPER_ADMIN";
    telegramId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        clerkId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        name: { type: String },
        image: { type: String },
        role: { type: String, enum: ["STUDENT", "MENTOR", "ADMIN", "SUPER_ADMIN"], default: "STUDENT" },
        telegramId: { type: String },
    },
    { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
