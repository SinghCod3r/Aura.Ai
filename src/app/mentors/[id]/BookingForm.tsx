"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/nextjs";
import ServiceSelector from "./ServiceSelector";
import SlotPicker from "./SlotPicker";
import PaymentButton from "./PaymentButton";
import { useEffect } from "react";

interface ServiceItem {
    id: string;
    title: string;
    price: number;
    description: string;
    durationMins?: number;
}

interface BookingFormProps {
    mentorId: string;
    services: ServiceItem[];
    hourlyRate: number;
    isDummy: boolean;
}

export default function BookingForm({
    mentorId,
    services,
    hourlyRate,
    isDummy,
}: BookingFormProps) {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{
        date: string;
        time: string;
        slotId?: string;
    } | null>(null);

    // Contact details
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Auto-fill for logged in users
    useEffect(() => {
        if (isSignedIn && user) {
            setName(user.fullName || user.firstName || "");
            setEmail(user.primaryEmailAddress?.emailAddress || "");
        }
    }, [isSignedIn, user]);

    const [bookingPhase, setBookingPhase] = useState<"SELECT" | "PAY">("SELECT");
    const [bookingData, setBookingData] = useState<{
        bookingId: string;
        orderId: string;
        amount: number;
        currency: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleInitialBooking = async () => {
        if (!selectedService || !selectedSlot) {
            toast.error("Please select a service and a time slot");
            return;
        }

        if (!name || !email || !phone) {
            toast.error("Please fill in your contact details");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Reserving your slot...");

        try {
            // 1. Reserve the slot and create a pending booking
            const bookingRes = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId,
                    serviceId: selectedService.id,
                    serviceName: selectedService.title,
                    price: selectedService.price,
                    scheduledDate: selectedSlot.date,
                    scheduledTime: selectedSlot.time,
                    slotId: selectedSlot.slotId,
                    customerDetails: { name, email, phone }
                }),
            });

            const bookingResult = await bookingRes.json();

            if (!bookingRes.ok) {
                if (bookingResult.error_code === "AUTH_REQUIRED") {
                    toast.dismiss(loadingToast);
                    toast.error(bookingResult.message || "Please sign in to continue");
                    setTimeout(() => {
                        window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
                    }, 2000);
                    return;
                }
                throw new Error(bookingResult.error || "Failed to reserve booking");
            }

            // If it's a dummy mentor, it might skip payment
            if (bookingResult.isMock) {
                toast.dismiss(loadingToast);
                toast.success("Booking confirmed! Redirecting...");
                setTimeout(() => {
                    window.location.href = "/dashboard?payment=success";
                }, 2000);
                return;
            }

            // 2. Create Razorpay Order
            toast.loading("Preparing payment...", { id: loadingToast });
            const paymentRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: bookingResult.bookingId,
                    amount: selectedService.price,
                }),
            });

            const paymentResult = await paymentRes.json();

            if (!paymentRes.ok) {
                throw new Error(paymentResult.error || "Failed to create payment order");
            }

            toast.dismiss(loadingToast);

            if (paymentResult.isMock) {
                toast.success("Payment confirmed (Demo Mode)!");
                setTimeout(() => {
                    window.location.href = "/dashboard?payment=success";
                }, 2000);
            } else {
                setBookingData({
                    bookingId: bookingResult.bookingId,
                    orderId: paymentResult.orderId,
                    amount: paymentResult.amount,
                    currency: paymentResult.currency,
                });
                setBookingPhase("PAY");
            }

        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (bookingPhase === "PAY" && bookingData) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Your Booking</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                        <p><b>Service:</b> {selectedService?.title}</p>
                        <p><b>Date:</b> {new Date(selectedSlot?.date || "").toLocaleDateString()}</p>
                        <p><b>Time:</b> {selectedSlot?.time}</p>
                        <p className="text-lg font-bold text-indigo-600 mt-4">Total: ₹{selectedService?.price}</p>
                    </div>
                </div>

                <PaymentButton
                    bookingId={bookingData.bookingId}
                    orderId={bookingData.orderId}
                    amount={bookingData.amount}
                    currency={bookingData.currency}
                    serviceName={selectedService?.title || "Mentorship"}
                    userInfo={{ name, email, phone }}
                    onSuccess={() => {
                        window.location.href = "/dashboard?payment=success";
                    }}
                    onFailure={(err) => {
                        toast.error(err);
                        setBookingPhase("SELECT");
                    }}
                />

                <Button
                    variant="ghost"
                    onClick={() => setBookingPhase("SELECT")}
                    className="w-full text-slate-500"
                >
                    Change Selection
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <ServiceSelector
                services={services}
                selectedId={selectedService?.id}
                onSelect={setSelectedService}
            />

            <SlotPicker
                mentorId={mentorId}
                onSelect={setSelectedSlot}
            />

            {/* Contact Details - Only show for guests or if phone is missing */}
            {(!isSignedIn || !phone) && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        {isSignedIn ? "Verify Your Phone Number" : "Your Contact Details"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!isSignedIn && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </>
                        )}
                        <input
                            type="tel"
                            placeholder="Phone Number (WhatsApp preferred)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isSignedIn ? "sm:col-span-2" : "col-span-full"}`}
                        />
                    </div>
                    {isSignedIn && (
                        <p className="text-xs text-slate-500 mt-2">
                            Booking as <b>{name}</b> ({email})
                        </p>
                    )}
                </div>
            )}

            <Button
                onClick={handleInitialBooking}
                disabled={loading || !selectedService || !selectedSlot || (isSignedIn ? !phone : (!name || !email || !phone))}
                className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-600/20"
            >
                {loading ? "Processing..." : mentorId.startsWith("dummy-") || isSignedIn ? `Book Session • ₹${selectedService?.price || 0}` : "Sign In to Book"}
            </Button>
        </div>
    );
}
