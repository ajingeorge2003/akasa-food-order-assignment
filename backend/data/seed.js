import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import connectDB from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { getUnsplashImage } from "../utils/unsplashAPI.js";

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await User.deleteMany({});

    const productData = [
      // Fruits
      { name: "Apple", category: "Fruit", price: 40, stock: 50, description: "Fresh red apples", searchQuery: "red apple fruit" },
      { name: "Banana", category: "Fruit", price: 25, stock: 100, description: "Sweet ripe bananas", searchQuery: "banana fruit" },
      { name: "Orange", category: "Fruit", price: 35, stock: 60, description: "Juicy oranges", searchQuery: "orange citrus" },
      { name: "Grapes", category: "Fruit", price: 55, stock: 70, description: "Seedless green grapes", searchQuery: "green grapes" },
      { name: "Mango", category: "Fruit", price: 65, stock: 45, description: "Sweet and juicy mangoes", searchQuery: "mango fruit" },
      { name: "Strawberries", category: "Fruit", price: 80, stock: 35, description: "Fresh red strawberries", searchQuery: "strawberry" },
      { name: "Watermelon", category: "Fruit", price: 50, stock: 25, description: "Sweet watermelon slices", searchQuery: "watermelon" },
      { name: "Papaya", category: "Fruit", price: 45, stock: 40, description: "Ripe golden papaya", searchQuery: "papaya fruit" },

      // Vegetables
      { name: "Carrot", category: "Vegetable", price: 20, stock: 100, description: "Organic carrots", searchQuery: "carrot vegetable" },
      { name: "Broccoli", category: "Vegetable", price: 45, stock: 40, description: "Fresh green broccoli", searchQuery: "broccoli" },
      { name: "Potato", category: "Vegetable", price: 15, stock: 120, description: "Golden potatoes", searchQuery: "potato" },
      { name: "Tomato", category: "Vegetable", price: 25, stock: 90, description: "Farm fresh tomatoes", searchQuery: "tomato" },
      { name: "Cucumber", category: "Vegetable", price: 18, stock: 80, description: "Crisp and fresh cucumber", searchQuery: "cucumber" },
      { name: "Bell Pepper", category: "Vegetable", price: 30, stock: 55, description: "Colorful bell peppers", searchQuery: "bell pepper" },
      { name: "Cabbage", category: "Vegetable", price: 22, stock: 65, description: "Fresh green cabbage", searchQuery: "cabbage" },
      { name: "Spinach", category: "Vegetable", price: 28, stock: 50, description: "Organic fresh spinach", searchQuery: "spinach" },

      // Non-Veg
      { name: "Chicken Curry", category: "Non-veg", price: 200, stock: 20, description: "Spicy ready-to-cook chicken curry", searchQuery: "chicken curry" },
      { name: "Fish Fillet", category: "Non-veg", price: 180, stock: 25, description: "Boneless fish fillets", searchQuery: "fish fillet" },
      { name: "Mutton Masala", category: "Non-veg", price: 250, stock: 15, description: "Premium mutton masala pack", searchQuery: "mutton masala" },
      { name: "Prawns", category: "Non-veg", price: 300, stock: 10, description: "Fresh tiger prawns", searchQuery: "prawns shrimp" },
      { name: "Chicken Breast", category: "Non-veg", price: 150, stock: 30, description: "Boneless chicken breast", searchQuery: "chicken breast" },
      { name: "Meat Balls", category: "Non-veg", price: 140, stock: 25, description: "Minced chicken/mutton", searchQuery: "Meat Balls" },
      { name: "Egg Curry", category: "Non-veg", price: 80, stock: 40, description: "Boiled eggs in spicy curry", searchQuery: "egg curry" },

      // Breads
      { name: "Bread Loaf", category: "Breads", price: 30, stock: 40, description: "Soft and freshly baked bread", searchQuery: "bread loaf" },
      { name: "Croissant", category: "Breads", price: 50, stock: 35, description: "Buttery French croissant", searchQuery: "croissant" },
      { name: "Garlic Naan", category: "Breads", price: 40, stock: 50, description: "Fluffy naan with garlic butter", searchQuery: "naan bread" },
      { name: "Multigrain Bread", category: "Breads", price: 45, stock: 20, description: "Healthy multigrain bread", searchQuery: "multigrain bread" },
      { name: "Roti", category: "Breads", price: 20, stock: 100, description: "Traditional Indian roti", searchQuery: "roti indian bread" },
      { name: "Puri", category: "Breads", price: 35, stock: 30, description: "Deep-fried puris", searchQuery: "puri bread" },
      { name: "Paratha", category: "Breads", price: 45, stock: 40, description: "Flaky Indian paratha", searchQuery: "paratha" },

      // Dairy
      { name: "Milk", category: "Dairy", price: 25, stock: 100, description: "Fresh toned milk", searchQuery: "milk" },
      { name: "Eggs (Dozen)", category: "Dairy", price: 60, stock: 30, description: "Farm-fresh eggs", searchQuery: "eggs dozen" },
      { name: "Paneer", category: "Dairy", price: 120, stock: 25, description: "Soft cottage cheese cubes", searchQuery: "paneer cheese" },
      { name: "Butter", category: "Dairy", price: 90, stock: 30, description: "Creamy salted butter", searchQuery: "butter" },
      { name: "Yogurt", category: "Dairy", price: 35, stock: 50, description: "Creamy plain yogurt", searchQuery: "yogurt" },
      { name: "Cheese Slice", category: "Dairy", price: 85, stock: 25, description: "Processed cheese slices", searchQuery: "cheese" },
      { name: "Cream", category: "Dairy", price: 45, stock: 20, description: "Fresh cooking cream", searchQuery: "cream dairy" }
    ];

    console.log("🔍 Fetching images from Unsplash API...");
    const products = [];

    for (const prod of productData) {
      console.log(`  📷 Fetching image for: ${prod.name}`);
      const imageData = await getUnsplashImage(prod.searchQuery);
      const image = imageData ? imageData.url : null;

      products.push({
        name: prod.name,
        category: prod.category,
        price: prod.price,
        stock: prod.stock,
        description: prod.description,
        image: image
      });

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await Product.insertMany(products);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash("password123", salt);
    await User.create({ email: "test@example.com", password: hashed });

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
