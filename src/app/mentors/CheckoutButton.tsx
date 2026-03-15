"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";

interface CheckoutButtonProps {
    mentorId: string;
    serviceId: string;
    serviceName: string;
    price: number;
}

export default function CheckoutButton({
    mentorId,
    serviceId,
    serviceName,
    price,
}: CheckoutButtonProps) {
    const { isSignedIn } = useAuth();
    const { openSignIn } = useClerk();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (isModalOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
    }, [isModalOpen]);

    const nextDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split("T")[0];
    });

    const timeSlots = [
        "09:00 AM",
        "11:00 AM",
        "02:00 PM",
        "04:30 PM",
        "07:00 PM",
    ];

    const redirectToLogin = () => {
        toast.error("Please login to book");

        openSignIn({
            redirectUrl: "/mentors",
        });
    };

    const handlePayment = async () => {
        if (!isSignedIn) {
            redirectToLogin();
            return;
        }

        if (!selectedDate || !selectedTime) {
            toast.error("Select date & time");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId,
                    serviceId,
                    price,
                    scheduledDate: selectedDate,
                    scheduledTime: selectedTime,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setIsModalOpen(false);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Aura.Ai Mentorship",
                description: serviceName,
                order_id: data.orderId,

                handler: async function (response: any) {
                    try {
                        await fetch("/api/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingId: data.bookingId,
                            }),
                        });

                        toast.success("Payment Successful");

                        window.location.href = "/dashboard?payment=success";
                    } catch (err) {
                        console.error("Payment verification failed");

                        toast.error("Payment verified but booking update failed");

                        window.location.href = "/dashboard";
                    }
                },

                prefill: {
                    name,
                    email,
                    contact: phone,
                },

                theme: {
                    color: "#4f46e5",
                },
            };

            //@ts-ignore
            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function () {
                toast.error("Payment failed or cancelled");
            });

            rzp.open();
        } catch (err: any) {
            toast.error(err.message);
        }

        setLoading(false);
    };

    return (
        <>
            {/* BUTTON */}
            <Button
                onClick={() => {

                    if (!isSignedIn) {
                        redirectToLogin();
                        return;
                    }

                    setIsModalOpen(true);
                }}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
                {!isSignedIn
                    ? "Login to Book"
                    : `Choose Slot & Book (₹${price})`}
            </Button>

            {/* MODAL */}
            {isModalOpen &&
                createPortal(

                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                        <div
                            className="absolute inset-0"
                            onClick={() => setIsModalOpen(false)}
                        />

                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">

                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold">Schedule Session</h2>
                                <p className="text-sm text-gray-500">{serviceName}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2">

                                {/* LEFT SLOT */}
                                <div className="p-6 border-r space-y-6">

                                    <div>

                                        <h3 className="font-semibold mb-3">
                                            Select Date
                                        </h3>

                                        <div className="flex flex-wrap gap-2">

                                            {nextDays.map((date) => {

                                                const d = new Date(date);

                                                const day = d.toLocaleDateString("en-US", { weekday: "short" });
                                                const month = d.toLocaleDateString("en-US", { month: "short" });
                                                const num = d.getDate();

                                                return (
                                                    <button
                                                        key={date}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border min-w-[70px]
                                                            ${selectedDate === date
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-white"
                                                            }`}
                                                    >
                                                        <span className="text-xs">{day}</span>
                                                        <span className="text-lg font-bold">{num}</span>
                                                        <span className="text-xs">{month}</span>
                                                    </button>
                                                );

                                            })}

                                        </div>

                                    </div>

                                    <div>

                                        <h3 className="font-semibold mb-3">
                                            Select Time
                                        </h3>

                                        <div className="grid grid-cols-2 gap-2">

                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`p-2 border rounded-lg text-sm
                                                            ${selectedTime === time
                                                            ? "bg-indigo-600 text-white"
                                                            : ""
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}

                                        </div>

                                    </div>

                                </div>

                                {/* RIGHT DETAILS */}
                                <div className="p-6 space-y-4">

                                    <h3 className="font-semibold">
                                        Your Details
                                    </h3>

                                    <input
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                    />

                                    <input
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                    />

                                    <input
                                        placeholder="Phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                    />

                                    <Button
                                        className="w-full mt-4"
                                        disabled={
                                            loading ||
                                            !selectedDate ||
                                            !selectedTime ||
                                            !name ||
                                            !email ||
                                            !phone
                                        }
                                        onClick={handlePayment}
                                    >
                                        {loading
                                            ? "Processing..."
                                            : `Pay ₹${price}`}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>

                                </div>

                            </div>

                        </div>

                    </div>,

                    document.body
                )}
        </>
    );
}
