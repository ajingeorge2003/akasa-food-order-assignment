import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/cart - get current user's cart (with product details)
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart || []);
  })
);

// POST /api/cart - add item { productId, qty }
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    if (!productId || !qty) {
      res.status(400);
      throw new Error("productId and qty are required");
    }
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const user = await User.findById(req.user._id);
    const existing = user.cart.find((c) => c.product.toString() === productId);
    if (existing) {
      existing.qty += Number(qty);
    } else {
      user.cart.push({ product: productId, qty: Number(qty) });
    }
    await user.save();
    const populated = await user.populate("cart.product");
    res.status(200).json(populated.cart);
  })
);

// PUT /api/cart - update quantity { productId, qty }
router.put(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    if (!productId || qty == null) {
      res.status(400);
      throw new Error("productId and qty are required");
    }
    const user = await User.findById(req.user._id);
    const item = user.cart.find((c) => c.product.toString() === productId);
    if (!item) {
      res.status(404);
      throw new Error("Item not found in cart");
    }
    item.qty = Number(qty);
    // remove if qty <= 0
    user.cart = user.cart.filter((c) => c.qty > 0);
    await user.save();
    const populated = await user.populate("cart.product");
    res.json(populated.cart);
  })
);

// DELETE /api/cart/:productId - remove an item
router.delete(
  "/:productId",
  protect,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((c) => c.product.toString() !== productId);
    await user.save();
    const populated = await user.populate("cart.product");
    res.json(populated.cart);
  })
);

export default router;
