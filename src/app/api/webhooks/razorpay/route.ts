import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongoose";
import { Booking, Payment, User, MentorProfile } from "@/models";
import { sendEmail } from "@/lib/brevo";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
        }

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyText)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(bodyText);
        await connectToDatabase();

        if (event.event === "payment.captured") {
            const paymentEntity = event.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const notes = paymentEntity.notes || {};
            const bookingId = notes.bookingId;

            if (bookingId) {
                const payment = await Payment.findOneAndUpdate(
                    { razorpayOrderId: orderId },
                    { razorpayPaymentId: paymentId, status: "SUCCESS" },
                    { new: true }
                );

                if (payment) {
                    const booking = await Booking.findByIdAndUpdate(bookingId, {
                        status: "CONFIRMED",
                        paymentId: payment._id
                    }).populate([
                        { path: 'studentId', model: User },
                        { path: 'mentorId', model: MentorProfile, populate: { path: 'userId', model: User } },
                        { path: 'slotId' }
                    ]);

                    if (booking) {
                        const student = booking.studentId as any;
                        const mentorProfile = booking.mentorId as any;
                        const mentor = mentorProfile.userId as any;
                        const slot = booking.slotId as any;

                        const dateStr = new Date(slot.startTime).toLocaleDateString();
                        const timeStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // 1. Notify Student (Email)
                        await sendEmail({
                            to: [{ email: student.email, name: student.name || "Student" }],
                            subject: "Mentorship Session Confirmed - Aura.Ai",
                            htmlContent: `
                                <h1>Booking Confirmed!</h1>
                                <p>Hi ${student.name}, your mentorship session with <b>${mentor.name}</b> is confirmed.</p>
                                <p><b>Date:</b> ${dateStr}<br><b>Time:</b> ${timeStr}</p>
                                <p>You can view details in your dashboard.</p>
                            `
                        });

                        // 2. Notify Mentor (Email & Telegram)
                        await sendEmail({
                            to: [{ email: mentor.email, name: mentor.name || "Mentor" }],
                            subject: "New Mentorship Booking - Aura.Ai",
                            htmlContent: `
                                <h1>New Booking Received!</h1>
                                <p>Hi ${mentor.name}, a new student (<b>${student.name}</b>) has booked a session with you.</p>
                                <p><b>Date:</b> ${dateStr}<br><b>Time:</b> ${timeStr}</p>
                            `
                        });

                        if (mentor.telegramId) {
                            await sendTelegramMessage(mentor.telegramId, 
                                `🚀 *New Booking Confirmed!*\n\n` +
                                `👤 *Student:* ${student.name}\n` +
                                `📅 *Date:* ${dateStr}\n` +
                                `⏰ *Time:* ${timeStr}\n\n` +
                                `Check your dashboard for details.`
                            );
                        }

                        if (student.telegramId) {
                            await sendTelegramMessage(student.telegramId,
                                `✅ *Payment Successful!*\n\n` +
                                `Your session with *${mentor.name}* is confirmed.\n\n` +
                                `📅 *Date:* ${dateStr}\n` +
                                `⏰ *Time:* ${timeStr}\n\n` +
                                `See you there! 🚀`
                            );
                        }
                    }
                }
            }
        }

        if (event.event === "payment.failed") {
            const paymentEntity = event.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: orderId },
                { status: "FAILED" }
            );

            if (payment) {
                const booking = await Booking.findByIdAndUpdate(payment.bookingId, { status: "FAILED" });
                if (booking) {
                    // CRITICAL: Release the slot so others can book it
                    const AvailabilitySlot = (await import("@/models")).AvailabilitySlot;
                    await AvailabilitySlot.findByIdAndUpdate(booking.slotId, { isBooked: false });
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Razorpay webhook error:", error);
        return NextResponse.json({ error: "Webhook error" }, { status: 500 });
    }
}
