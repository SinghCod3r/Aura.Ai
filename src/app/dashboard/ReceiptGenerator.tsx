"use client";

import { jsPDF } from "jspdf";

interface ReceiptData {
    bookingId: string;
    transactionId: string;
    date: string;
    studentName: string;
    mentorName: string;
    serviceName: string;
    amount: number;
}

export const generateReceiptPDF = (data: ReceiptData) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Colors
    const primaryColor = [79, 70, 229]; // Indigo-600

    // Header
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Aura.Ai", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("AI-Powered Mentorship Platform", 20, 26);

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("Payment Receipt", 140, 20);

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 35, 190, 35);

    // Receipt Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Receipt ID:", 20, 45);
    doc.text("Date:", 20, 50);
    doc.text("Transaction ID:", 20, 55);

    doc.setTextColor(30, 30, 30);
    doc.text(data.bookingId.slice(-8).toUpperCase(), 50, 45);
    doc.text(new Date(data.date).toLocaleDateString(), 50, 50);
    doc.text(data.transactionId, 50, 55);

    // Content Box
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(20, 65, 170, 60, "F");

    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("Billing Details", 25, 75);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Student:", 25, 85);
    doc.text("Mentor:", 25, 90);
    doc.text("Service:", 25, 95);

    doc.setTextColor(30, 30, 30);
    doc.text(data.studentName, 60, 85);
    doc.text(data.mentorName, 60, 90);
    doc.text(data.serviceName, 60, 95);

    // Total
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(130, 110, 180, 110);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Paid:  ₹${data.amount}`, 130, 118);

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, 140, { align: "center" });
    doc.text("Thank you for choosing Aura.Ai for your career growth!", 105, 145, { align: "center" });

    // Save
    doc.save(`AuraAi_Receipt_${data.bookingId.slice(-6)}.pdf`);
};

export default function ReceiptButton({ data, className }: { data: ReceiptData, className?: string }) {
    return (
        <button
            onClick={() => generateReceiptPDF(data)}
            className={className || "text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"}
        >
            Download Receipt
        </button>
    );
}
