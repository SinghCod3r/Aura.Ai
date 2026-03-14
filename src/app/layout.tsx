import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura.Ai - Build Your Career With AI & Mentors",
  description: "AI-driven career assessment and 1:1 mentorship platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        </head>
        <body
          className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-white text-slate-900`}
        >
          <Navbar />
          <main className="flex-1 flex flex-col relative">
            <Toaster position="top-right" />
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
