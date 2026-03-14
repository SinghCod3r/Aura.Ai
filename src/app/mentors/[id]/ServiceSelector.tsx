"use client";

import { useState } from "react";

interface ServiceItem {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    description: string;
    durationMins?: number;
}

interface ServiceSelectorProps {
    services: ServiceItem[];
    onSelect: (service: ServiceItem) => void;
    selectedId?: string;
}

export default function ServiceSelector({ services, onSelect, selectedId }: ServiceSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 mb-3">
                Choose a Service
            </label>
            {services.map((service) => {
                const isSelected = selectedId === service.id;
                return (
                    <button
                        key={service.id}
                        onClick={() => onSelect(service)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                            ${isSelected
                                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-600/10"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className={`font-bold ${isSelected ? "text-indigo-700" : "text-slate-900"}`}>
                                    {service.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {service.description}
                                </p>
                                {service.durationMins && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        ⏱ {service.durationMins} mins
                                    </p>
                                )}
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                                {service.originalPrice && (
                                    <p className="text-xs text-slate-400 line-through">
                                        ₹{service.originalPrice}
                                    </p>
                                )}
                                <p className={`text-lg font-extrabold ${isSelected ? "text-indigo-600" : "text-slate-900"}`}>
                                    ₹{service.price}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
