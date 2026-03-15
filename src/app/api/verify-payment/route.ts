import crypto from "crypto";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking, Payment, AvailabilitySlot } from "@/models";

export async function POST(req: Request) {

    try {

        await connectToDatabase();

        const body = await req.json();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({
                success: false,
                error: "Missing payment details"
            });
        }

        // VERIFY SIGNATURE
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {

            return NextResponse.json({
                success: false,
                error: "Payment verification failed"
            });

        }

        // UPDATE PAYMENT
        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                status: "SUCCESS"
            },
            { new: true }
        );

        if (!payment) {
            return NextResponse.json({
                success: false,
                error: "Payment record not found"
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json({
                success: false,
                error: "Booking not found"
            });
        }

        // CONFIRM BOOKING
        booking.status = "CONFIRMED";
        booking.paymentId = payment._id;

        await booking.save();

        // LOCK SLOT
        if (booking.slotId) {

            await AvailabilitySlot.findByIdAndUpdate(
                booking.slotId,
                { isBooked: true }
            );

        }

        return NextResponse.json({
            success: true,
            message: "Payment verified and booking confirmed"
        });

    } catch (error: any) {

        console.error("Verify Payment Error:", error);

        return NextResponse.json({
            success: false,
            error: "Payment verification failed",
            details: error.message
        });

    }

}