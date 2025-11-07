import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { verifyEmailConfig } from "./utils/emailService.js";

dotenv.config();

const app = express();
connectDB();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

app.get("/", (req, res) => res.send("API is running..."));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    email: verifyEmailConfig(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
