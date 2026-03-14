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
        const { mentorId, serviceId, scheduledDate, scheduledTime, price } = body;

        if (!mentorId || !serviceId || !scheduledDate || !scheduledTime || price === undefined) {
            return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
        }

        // 0. Handle Dummy Mentors Early to prevent CastErrors in MongoDB
        if (mentorId.toString().startsWith("dummy-")) {
            return NextResponse.json({
                success: true,
                isMock: true,
                bookingId: `mock_booking_${Math.random().toString(36).substring(7)}`,
                message: "Booking successful (Demo Mode)"
            });
        }

        const { userId: clerkId } = await auth();
        let user;

        if (!clerkId) {
            // Guest booking for dummy mentors only
            if (mentorId.toString().startsWith("dummy-")) {
                user = await User.findOne({ email: "guest@aura.ai" });
                if (!user) {
                    user = await User.create({
                        clerkId: "guest_user",
                        email: "guest@aura.ai",
                        name: "Guest User",
                        role: "STUDENT"
                    });
                }
            } else {
                return NextResponse.json({ 
                    error: "Authentication Required", 
                    error_code: "AUTH_REQUIRED",
                    message: "Please sign in to book sessions with professional mentors." 
                }, { status: 200 }); // Return 200 with JSON to prevent middleware intercept
            }
        } else {
            user = await User.findOne({ clerkId });
            if (!user) {
                return NextResponse.json({ error: "User profile not found" }, { status: 404 });
            }
        }

        // 1. Create Slot (Dynamic for this implementation)
        const parsedDate = new Date(`${scheduledDate} ${scheduledTime}`);
        const slot = await AvailabilitySlot.create({
            mentorProfileId: mentorId,
            startTime: parsedDate,
            endTime: new Date(parsedDate.getTime() + 60 * 60 * 1000),
            isBooked: true
        });

        // 2. Create Pending Booking
        const booking = await Booking.create({
            studentId: user._id,
            mentorId: mentorId,
            serviceId: serviceId,
            slotId: slot._id,
            status: "PENDING",
        });

        // 3. Handle Payment (Mock or Razorpay)
        const isDummy = mentorId.toString().startsWith("dummy-");
        const isMockEntry = ENABLE_MOCK_PAYMENTS || isDummy;

        if (isDummy) {
             return NextResponse.json({
                success: true,
                isMock: true,
                bookingId: `mock_booking_${Math.random().toString(36).substring(7)}`
            });
        }

        if (isMockEntry) {
            // Create a successful mock payment entry
            const payment = await Payment.create({
                userId: user._id,
                bookingId: booking._id,
                razorpayOrderId: `mock_order_${Math.random().toString(36).substring(7)}`,
                razorpayPaymentId: `mock_pay_${Math.random().toString(36).substring(7)}`,
                amount: price,
                status: "SUCCESS"
            });

            // Update booking status
            booking.status = "CONFIRMED";
            booking.paymentId = payment._id;
            await booking.save();

            return NextResponse.json({
                success: true,
                isMock: true,
                bookingId: booking._id
            });
        }

        // Real Razorpay Flow
        const amountInPaise = Math.round(price * 100);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: user._id.toString(),
            }
        });

        // Create initial pending payment record
        await Payment.create({
            userId: user._id,
            bookingId: booking._id,
            razorpayOrderId: order.id,
            amount: price,
            status: "PENDING"
        });

        return NextResponse.json({
            success: true,
            isMock: false,
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
        return NextResponse.json(
            { error: "Failed to process booking", details: error.message },
            { status: 500 }
        );
    }
}
