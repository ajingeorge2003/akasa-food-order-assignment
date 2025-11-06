import dotenv from "dotenv";
dotenv.config();
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await User.deleteMany({});

    const products = [
      { name: "Apple", category: "Fruit", price: 40, stock: 50, description: "Fresh apples" },
      { name: "Bread Loaf", category: "Breads", price: 30, stock: 40, description: "Baked daily" },
      { name: "Chicken Curry", category: "Non-veg", price: 200, stock: 20, description: "Ready to cook" },
      { name: "Carrot", category: "Vegetable", price: 20, stock: 100, description: "Organic carrots" }
    ];
    await Product.insertMany(products);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("password123", salt);
    await User.create({ email: "test@example.com", password: hashed });

    console.log("Seed completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
