// controllers/payment.controller.ts

import type { Request, Response, NextFunction } from "express";
// src/controllers/payment.controller.ts
// src/controllers/payment.controller.ts
import { paymentService } from '../services/payment.js'

import { crypto } from 'crypto';
export class PaymentController {
    //create payment order
    async createPaymentOrder(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid amount",
                });
            }

            const razorpayOrder =
                await paymentService.createRazorpayOrder(
                    amount,
                    `receipt_${Date.now()}`
                );

            return res.status(200).json({
                success: true,
                data: {
                    razorpay_order_id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key_id: process.env.RAZORPAY_KEY_ID,
                },
            });

        } catch (error) {
            next(error);
        }
    }
    async verifyPayment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {

            const {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature
            } = req.body;

            if (
                !razorpay_payment_id ||
                !razorpay_order_id ||
                !razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Missing payment details",
                });
            }
            const sha = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
            sha.update(razorpay_order_id + `|${razorpay_payment_id}`);
            const digest = sha.digest('hex');


            if (digest !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: "Transaction is not legit",
                });
            }

            // Payment is authentic
            // Update your PostgreSQL order here

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });

        } catch (error) {
            next(error);
        }
    }

}
export const paymentController = new PaymentController();

