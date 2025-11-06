import express from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { protect } from "../middleware/authMiddleware.js";
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

      res.status(201).json({ message: "Order placed", order: order[0] });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  })
);

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
