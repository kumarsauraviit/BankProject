// services/payment.service.ts

import razorpay from "../config/razorpay.js";

export class PaymentService {

    async createRazorpayOrder(
        amount: number,
        receipt: string
    ) {

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt,
        };

        const order = await razorpay.orders.create(options);

        return order;
    }
}

export const paymentService = new PaymentService();