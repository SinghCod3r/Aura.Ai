"use client";

import { useState, useEffect } from "react";

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
}

interface SlotPickerProps {
    mentorId: string;
    onSelect: (slot: { date: string; time: string; slotId?: string }) => void;
}

// Fallback time slots when no real availability exists in DB
const FALLBACK_TIMES = ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM", "07:00 PM"];

export default function SlotPicker({ mentorId, onSelect }: SlotPickerProps) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();
    const [dbSlots, setDbSlots] = useState<Slot[]>([]);
    const [hasDatabaseSlots, setHasDatabaseSlots] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate next 7 days
    const nextDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split("T")[0];
    });

    // Fetch real availability when date changes
    useEffect(() => {
        if (!selectedDate) return;

        const fetchSlots = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/mentors/${mentorId}/availability?date=${selectedDate}`);
                const data = await res.json();
                setDbSlots(data.slots || []);
                setHasDatabaseSlots(data.hasDatabaseSlots || false);
            } catch {
                setDbSlots([]);
                setHasDatabaseSlots(false);
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [selectedDate, mentorId]);

    // Reset time selection when date changes
    useEffect(() => {
        setSelectedTime("");
        setSelectedSlotId(undefined);
    }, [selectedDate]);

    // Notify parent when selection changes
    useEffect(() => {
        if (selectedDate && selectedTime) {
            onSelect({ date: selectedDate, time: selectedTime, slotId: selectedSlotId });
        }
    }, [selectedDate, selectedTime, selectedSlotId]);

    // Determine which time slots to show
    const timeSlots = hasDatabaseSlots
        ? dbSlots.map((s) => ({
              label: new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              id: s.id,
          }))
        : FALLBACK_TIMES.map((t) => ({ label: t, id: undefined }));

    return (
        <div className="space-y-6">
            {/* Date Picker */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                    Select Date
                </label>
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
                                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border min-w-[64px] transition-all duration-200
                                    ${isSelected
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                                    }`}
                            >
                                <span className={`text-xs font-semibold uppercase ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                                    {dayName}
                                </span>
                                <span className="text-lg font-bold mt-1">{dayNum}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Select Time
                        {!hasDatabaseSlots && (
                            <span className="text-xs font-normal text-slate-400 ml-2">
                                (Flexible scheduling)
                            </span>
                        )}
                    </label>

                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent mr-3" />
                            Loading availability...
                        </div>
                    ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 text-center">
                            No available slots for this date. Try another day.
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot.label}
                                    onClick={() => {
                                        setSelectedTime(slot.label);
                                        setSelectedSlotId(slot.id);
                                    }}
                                    className={`p-2 rounded-lg border text-sm font-medium transition-all duration-200
                                        ${selectedTime === slot.label
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                                        }`}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
