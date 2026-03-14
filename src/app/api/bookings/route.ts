import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User, AvailabilitySlot, Booking, Payment } from "@/models";
import { razorpay } from "@/lib/razorpay";
import mongoose from "mongoose";

// Set this to true to bypass Razorpay and simulate successful payments for testing
const ENABLE_MOCK_PAYMENTS = process.env.ENABLE_MOCK_PAYMENTS === "true"; 

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        
        const body = await req.json();
        const { mentorId, serviceId, scheduledDate, scheduledTime, slotId, price } = body;

        if (!mentorId || !serviceId || !scheduledDate || !scheduledTime || price === undefined) {
            return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
        }

        // 0. Handle Dummy Mentors Early
        if (mentorId.toString().startsWith("dummy-")) {
            return NextResponse.json({
                success: true,
                isMock: true,
                bookingId: `mock_booking_${Math.random().toString(36).substring(7)}`,
                message: "Booking successful (Demo Mode)"
            });
        }

        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({ 
                error: "Authentication Required", 
                error_code: "AUTH_REQUIRED",
                message: "Please sign in to book sessions with professional mentors." 
            }, { status: 200 }); 
        }

        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        let finalSlotId = slotId;

        // 1. Reserve Slot (Atomic if slotId provided, otherwise create new)
        if (slotId && mongoose.Types.ObjectId.isValid(slotId)) {
            const reservedSlot = await AvailabilitySlot.findOneAndUpdate(
                { _id: slotId, isBooked: false },
                { isBooked: true },
                { new: true }
            );

            if (!reservedSlot) {
                return NextResponse.json({ 
                    error: "This slot was just taken. Please choose another one." 
                }, { status: 409 });
            }
        } else {
            // Dynamic slot creation (for mentors who haven't pre-defined slots)
            const parsedDate = new Date(`${scheduledDate} ${scheduledTime}`);
            const newSlot = await AvailabilitySlot.create({
                mentorProfileId: mentorId,
                startTime: parsedDate,
                endTime: new Date(parsedDate.getTime() + 60 * 60 * 1000),
                isBooked: true
            });
            finalSlotId = newSlot._id;
        }

        // 2. Create Pending Booking
        const booking = await Booking.create({
            studentId: user._id,
            mentorId: mentorId,
            serviceId: serviceId,
            slotId: finalSlotId,
            status: "PENDING",
        });

        return NextResponse.json({
            success: true,
            bookingId: booking._id,
            message: "Slot reserved successfully"
        });

    } catch (error: any) {
        console.error("Booking API Error:", error);
        return NextResponse.json(
            { error: "Failed to process booking", details: error.message },
            { status: 500 }
        );
    }
}

