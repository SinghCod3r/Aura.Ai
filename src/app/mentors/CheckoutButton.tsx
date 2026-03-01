"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface CheckoutButtonProps {
    mentorId: string;
    serviceId: string;
    serviceName: string;
    price: number;
}

export default function CheckoutButton({ mentorId, serviceId, serviceName, price }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Simple state for Date/Time picking
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");

    const handlePayment = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select a date and time");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Initializing secure checkout...");

        try {
            // 1. Create a booking and Razorpay order in our backend
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId,
                    serviceId,
                    serviceName,
                    price,
                    // Passing dynamic slot data up instead of a pre-existing slot ID
                    scheduledDate: selectedDate,
                    scheduledTime: selectedTime
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to initiate booking");
            }

            toast.dismiss(loadingToast);
            setIsModalOpen(false); // Close modal on success

            // 2. Initialize Razorpay Client SDK
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Aura.Ai Mentorship",
                description: `Book: ${serviceName} on ${selectedDate} at ${selectedTime}`,
                order_id: data.orderId,
                handler: function (response: any) {
                    toast.success("Payment successful! Redirecting to your dashboard...", { duration: 4000 });
                    setTimeout(() => {
                        window.location.href = "/dashboard?payment=success";
                    }, 2000);
                },
                prefill: {
                    name: "Aura.Ai Student",
                    email: "student@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#4f46e5", // Indigo-600
                },
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                toast.error(`Payment failed: ${response.error.description}`);
            });

            rzp.open();

        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || "An error occurred during checkout");
        } finally {
            setLoading(false);
        }
    };

    // Generate upcoming 7 days
    const nextDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Start from tomorrow
        return d.toISOString().split('T')[0];
    });

    // Mock Time Slots
    const timeSlots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM", "07:00 PM"];

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors border-none shadow-none"
            >
                Choose Slot & Book (₹{price})
            </Button>

            {/* Simple Native Modal / Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-900">Schedule Session</h3>
                            <p className="text-sm text-slate-500 mt-1">{serviceName}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Select Date</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {nextDays.map((dateStr) => {
                                        const dateObj = new Date(dateStr);
                                        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                                        const dayNum = dateObj.getDate();
                                        const isSelected = selectedDate === dateStr;

                                        return (
                                            <button
                                                key={dateStr}
                                                onClick={() => setSelectedDate(dateStr)}
                                                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border min-w-[64px] transition-all
                                                    ${isSelected
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                                            >
                                                <span className={`text-xs font-semibold uppercase ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>{dayName}</span>
                                                <span className="text-lg font-bold mt-1">{dayNum}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Select Time</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 rounded-lg border text-sm font-medium transition-all
                                                ${selectedTime === time
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 shadow-md shadow-indigo-600/20"
                                onClick={handlePayment}
                                disabled={loading || !selectedDate || !selectedTime}
                            >
                                {loading ? "Processing..." : `Pay ₹${price}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
