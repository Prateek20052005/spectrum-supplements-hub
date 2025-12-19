import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  flavour: { type: String, default: null },
  quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev / hot-reload
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;
