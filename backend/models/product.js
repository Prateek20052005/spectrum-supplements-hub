import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: String,
  comment: String,
  rating: Number,
  date: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    category: String,
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    images: [String],
    flavours: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev / hot-reload
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
