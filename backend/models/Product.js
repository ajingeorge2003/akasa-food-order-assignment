import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    image: { type: String }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
