import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking, Payment, User, MentorProfile } from "@/models";
import { razorpay } from "@/lib/razorpay";
import { sendEmail } from "@/lib/brevo";
import { sendTelegramMessage } from "@/lib/telegram";

const ENABLE_MOCK_PAYMENTS = process.env.ENABLE_MOCK_PAYMENTS === "true";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        
        const body = await req.json();
        const { bookingId, amount } = body;

        if (!bookingId || !amount) {
            return NextResponse.json({ error: "Missing bookingId or amount" }, { status: 400 });
        }

        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Authentication Required" }, { status: 401 });
        }

        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        const booking = await Booking.findById(bookingId).populate([
            { path: 'studentId' },
            { path: 'mentorId', populate: { path: 'userId' } },
            { path: 'slotId' }
        ]);
        
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (ENABLE_MOCK_PAYMENTS) {
            // Create successful mock payment
            const payment = await Payment.create({
                userId: user._id,
                bookingId: booking._id,
                razorpayOrderId: `mock_order_${Math.random().toString(36).substring(7)}`,
                razorpayPaymentId: `mock_pay_${Math.random().toString(36).substring(7)}`,
                amount: amount,
                status: "SUCCESS"
            });

            // Confirm booking
            booking.status = "CONFIRMED";
            booking.paymentId = payment._id;
            await booking.save();

            // --- TRACE NOTIFICATION LOGIC (Mirroring Webhook) ---
            const student = booking.studentId as any;
            const mentorProfile = booking.mentorId as any;
            const mentor = mentorProfile.userId as any;
            const slot = booking.slotId as any;

            const dateStr = slot ? new Date(slot.startTime).toLocaleDateString() : "TBD";
            const timeStr = slot ? new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

            // Student Email
            await sendEmail({
                to: [{ email: student.email, name: student.name || "Student" }],
                subject: "Mentorship Session Confirmed (MOCK) - Aura.Ai",
                htmlContent: `<p>Hi ${student.name}, your session with <b>${mentor.name}</b> is confirmed.</p>`
            }).catch(e => console.error("Mock email fail:", e));

            // Student Telegram
            if (student.telegramId) {
                await sendTelegramMessage(student.telegramId, `✅ *Mock Payment Successful!* Your session with *${mentor.name}* is confirmed.`).catch(e => console.error("Mock TG fail:", e));
            }

            // Mentor Telegram
            if (mentor.telegramId) {
                await sendTelegramMessage(mentor.telegramId, `🚀 *Mock Booking Received!* User *${student.name}* booked a session for ${dateStr} at ${timeStr}.`).catch(e => console.error("Mock TG mentor fail:", e));
            }

            return NextResponse.json({ success: true, isMock: true });
        }

        // Create real Razorpay order
        const amountInPaise = Math.round(amount * 100);
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: user._id.toString(),
            }
        });

        // Create pending payment record
        await Payment.create({
            userId: user._id,
            bookingId: booking._id,
            razorpayOrderId: order.id,
            amount: amount,
            status: "PENDING"
        });

        return NextResponse.json({
            success: true,
            isMock: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error: any) {
        console.error("Create Order Error:", error);
        return NextResponse.json(
            { error: "Failed to create payment order", details: error.message },
            { status: 500 }
        );
    }
}
