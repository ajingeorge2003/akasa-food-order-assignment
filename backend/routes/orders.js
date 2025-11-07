import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { protect } from "../middleware/authMiddleware.js";
import { sendEmailWithTimeout } from "../utils/emailService.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = express.Router();

// POST /api/orders/checkout
router.post(
  "/checkout",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const cart = user.cart || [];
    if (cart.length === 0) {
      res.status(400);
      throw new Error("Cart is empty");
    }

    // Collect insufficient items
    const insufficient = [];
    for (const item of cart) {
      const prod = await Product.findById(item.product._id);
      if (!prod || prod.stock < item.qty) {
        insufficient.push({ product: item.product._id, name: item.product.name, available: prod ? prod.stock : 0, requested: item.qty });
      }
    }
    if (insufficient.length > 0) {
      res.status(400).json({ message: "Some items are not available", insufficient });
      return;
    }

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      // Deduct stock
      for (const item of cart) {
        const updated = await Product.updateOne({ _id: item.product._id }, { $inc: { stock: -item.qty } }, { session });
        if (updated.matchedCount === 0) {
          throw new Error(`Failed to update stock for ${item.product._id}`);
        }
      }

      // Create order snapshot
      const orderItems = cart.map((c) => ({ product: c.product._id, name: c.product.name, price: c.product.price, qty: c.qty }));
      const total = orderItems.reduce((s, it) => s + it.price * it.qty, 0);

      const order = await Order.create([
        {
          user: user._id,
          items: orderItems,
          total,
          orderId: uuidv4()
        }
      ], { session });

      // Clear user's cart
      user.cart = [];
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Send invoice email (non-blocking)
      if (process.env.EMAIL_PASSWORD && process.env.EMAIL_FROM) {
        try {
          const invoiceHtml = generateInvoiceHtml(order[0], user.email, orderItems);
          await sendEmailWithTimeout({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Order Confirmation - Invoice #${order[0].orderId.slice(-6).toUpperCase()}`,
            html: invoiceHtml
          });
        } catch (emailErr) {
          console.error("Failed to send invoice email:", emailErr.message);
          // Don't fail the order if email fails - log it and continue
        }
      }

      res.status(201).json({ message: "Order placed", order: order[0] });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  })
);

// Function to generate invoice HTML
function generateInvoiceHtml(order, userEmail, orderItems) {
  const itemsHtml = orderItems
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `)
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">Akasa Food Order</h1>
          <p style="color: #666; margin: 5px 0;">Your Order Confirmation</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.orderId.slice(-6).toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 3px;">${order.status || 'Pending'}</span></p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #667eea;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #667eea;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #667eea;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div style="border-top: 2px solid #667eea; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #667eea;">
            <span>Total Amount:</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #667eea; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1565c0;">✓ Thank you for your order! Your items will be prepared shortly.</p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 15px; color: #666; font-size: 12px; text-align: center;">
          <p style="margin: 5px 0;">Order Confirmation sent to: <strong>${userEmail}</strong></p>
          <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
          <p style="margin: 5px 0; color: #999;">© 2024 Akasa Food Order. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

// GET /api/orders - list user's orders
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

// GET /api/orders/:id - get order
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Forbidden");
    }
    res.json(order);
  })
);

export default router;
