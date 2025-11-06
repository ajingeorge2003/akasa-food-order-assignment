import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products?category=All or category name
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = {};
    if (category && category.toLowerCase() !== "all") {
      filter.category = category;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json(product);
  })
);

// Dev: seed some products - POST /api/products/seed
router.post(
  "/seed",
  asyncHandler(async (req, res) => {
    const sample = [
      { name: "Apple", category: "Fruit", price: 40, stock: 50, description: "Fresh apples" },
      { name: "Bread Loaf", category: "Breads", price: 30, stock: 40, description: "Baked daily" },
      { name: "Chicken Curry", category: "Non-veg", price: 200, stock: 20, description: "Ready to cook" },
      { name: "Carrot", category: "Vegetable", price: 20, stock: 100, description: "Organic carrots" }
    ];
    await Product.deleteMany({});
    const created = await Product.insertMany(sample);
    res.status(201).json(created);
  })
);

export default router;
