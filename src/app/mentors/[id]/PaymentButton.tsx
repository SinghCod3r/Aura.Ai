"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

interface PaymentButtonProps {
    bookingId: string;
    orderId: string;
    amount: number;
    currency: string;
    serviceName: string;
    userInfo: { name: string; email: string; phone: string };
    onSuccess: () => void;
    onFailure: (error: string) => void;
}

export default function PaymentButton({
    bookingId,
    orderId,
    amount,
    currency,
    serviceName,
    userInfo,
    onSuccess,
    onFailure,
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        setLoading(true);

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount,
            currency,
            name: "Aura.Ai Mentorship",
            description: `Book: ${serviceName}`,
            order_id: orderId,
            handler: function (response: any) {
                toast.success("Payment successful! Redirecting...", { duration: 4000 });
                onSuccess();
            },
            prefill: {
                name: userInfo.name || "Aura.Ai Student",
                email: userInfo.email || "student@example.com",
                contact: userInfo.phone || "9999999999",
            },
            theme: {
                color: "#4f46e5",
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                },
            },
        };

        // @ts-ignore
        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (response: any) {
            onFailure(response.error.description);
            setLoading(false);
        });

        rzp.open();
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full font-semibold shadow-md shadow-indigo-600/20"
        >
            {loading ? "Processing..." : `Pay ₹${Math.round(amount / 100)}`}
        </Button>
    );
}
