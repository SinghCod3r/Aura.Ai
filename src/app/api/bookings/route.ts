import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AvailabilitySlot, Booking } from "@/models";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { mentorId, serviceId, scheduledDate, scheduledTime, price } = body;

        if (!mentorId || !serviceId || !scheduledDate || !scheduledTime || !price) {
            return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
        }

        await connectToDatabase();

        // Get internal user ID based on Clerk ID
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: "User not found in db" }, { status: 404 });
        }

        // For this flexible flow, we dynamically create a "Slot" object to satisfy the schema's relational needs
        // In a full calendar system, this would be validating against pre-defined mentor availability.
        const parsedDate = new Date(`${scheduledDate} ${scheduledTime}`);

        const slot = await AvailabilitySlot.create({
            mentorProfileId: mentorId,
            startTime: parsedDate,
            endTime: new Date(parsedDate.getTime() + 60 * 60 * 1000), // Assuming 1 hour slot
            isBooked: true // Mark booked immediately
        });

        // Create a pending booking
        const booking = await Booking.create({
            studentId: user._id,
            mentorId: mentorId,
            serviceId: serviceId,
            slotId: slot._id,
            status: "PENDING",
        });

        // Create a Razorpay Order
        const amountInPaise = Math.round(price * 100);
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${booking._id}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            bookingId: booking._id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: unknown) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
