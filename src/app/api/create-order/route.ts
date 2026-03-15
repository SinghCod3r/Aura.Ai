import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {

 const body = await req.json()

 const { amount } = body

 const order = await razorpay.orders.create({
  amount: amount * 100,
  currency: "INR",
  receipt: "receipt_" + Date.now(),
 })

 return NextResponse.json({
  orderId: order.id,
  amount: order.amount,
  currency: order.currency
 })
}