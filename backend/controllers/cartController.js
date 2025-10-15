// backend/controllers/cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

/**
 * @desc   Get cart for logged-in user
 * @route  GET /api/cart
 * @access Private
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
  if (cart) res.json(cart);
  else res.json({ items: [] });
});

/**
 * @desc   Add/update item in cart (create cart if not exists)
 * @route  POST /api/cart
 * @access Private
 * body: { productId, quantity }
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ message: "Insufficient stock" });

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex((i) => i.productId.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  const saved = await cart.save();
  res.status(200).json(saved);
});

/**
 * @desc   Remove item from cart
 * @route  DELETE /api/cart/:productId
 * @access Private
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  const saved = await cart.save();
  res.json(saved);
});

/**
 * @desc   Clear cart
 * @route  DELETE /api/cart
 * @access Private
 */
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user._id });
  res.json({ message: "Cart cleared" });
});
