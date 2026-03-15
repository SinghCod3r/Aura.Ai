import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AvailabilitySlot, Booking, Payment } from "@/models";
import { razorpay } from "@/lib/razorpay";
import mongoose from "mongoose";

export async function POST(req: Request) {

    try {

        await connectToDatabase();

        const body = await req.json();

        const { mentorId, serviceId, scheduledDate, scheduledTime, price } = body;
        console.log("PRICE FROM FRONTEND:", price);

        if (!mentorId || !serviceId || !scheduledDate || !scheduledTime || price === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({
            error: "Authentication Required",
            error_code: "AUTH_REQUIRED"
        }, { status: 200 });
        }

        // FIND USER
        let user = await User.findOne({ clerkId });

        if (!user) {

        const clerkUser = await currentUser();

        const email =
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            `user_${Date.now()}@example.com`;

        const name = clerkUser?.fullName || "New User";

        user = await User.create({
            clerkId,
            name,
            email
        });
        }

        const parsedDate = new Date(`${scheduledDate} ${scheduledTime}`);

        // HANDLE mentorId safely
        let mentorObjectId;

        if (mongoose.Types.ObjectId.isValid(mentorId)) {
            mentorObjectId = new mongoose.Types.ObjectId(mentorId);
        } else {
            console.warn("Dummy mentor detected, using fallback ObjectId");
            mentorObjectId = new mongoose.Types.ObjectId();
        }

        // HANDLE serviceId safely
        let serviceObjectId;

        if (mongoose.Types.ObjectId.isValid(serviceId)) {
            serviceObjectId = new mongoose.Types.ObjectId(serviceId);
        } else {
            console.warn("Dummy service detected, using fallback ObjectId");
            serviceObjectId = new mongoose.Types.ObjectId();
        }

        const slot = await AvailabilitySlot.create({
            mentorProfileId: mentorObjectId,
            startTime: parsedDate,
            endTime: new Date(parsedDate.getTime() + 60 * 60 * 1000),
            isBooked: false
        });

        const booking = await Booking.create({
            studentId: user._id,
            mentorId: mentorObjectId,
            serviceId: serviceObjectId,
            slotId: slot._id,
            status: "PENDING"
        });

        const amountInPaise = Math.round(Number(price) * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: user._id.toString()
            }
        });

        await Payment.create({
            userId: user._id,
            bookingId: booking._id,
            razorpayOrderId: order.id,
            amount: price,
            status: "PENDING"
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            bookingId: booking._id,
            amount: order.amount,
            currency: order.currency,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error: any) {

        console.error("Booking API Error:", error);

        return NextResponse.json({
        error: "Failed to process booking",
        details: error.message
        }, { status: 500 });
    }
}