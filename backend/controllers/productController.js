// backend/controllers/productController.js
import asyncHandler from "express-async-handler";
import Product from "../models/product.js";
import Order from "../models/order.js";

/**
 * @desc   Get all products (with optional search & category filter)
 * @route  GET /api/products
 * @access Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;
  const query = {};

  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }
  if (category) {
    query.category = category;
  }

  const products = await Product.find(query);
  res.json(products);
});

/**
 * @desc   Get product by ID
 * @route  GET /api/products/:id
 * @access Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: "Product not found" });
});

/**
 * @desc   Create a product (admin)
 * @route  POST /api/products
 * @access Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, price, stock, images, flavours } = req.body;
  const product = new Product({
    name,
    brand,
    category,
    description,
    price,
    stock,
    images,
    flavours: Array.isArray(flavours)
      ? flavours
      : typeof flavours === "string"
        ? flavours
            .split(/[\n,]/)
            .map((f) => f.trim())
            .filter(Boolean)
        : [],
  });
  const created = await product.save();
  res.status(201).json(created);
});

/**
 * @desc   Update a product (admin)
 * @route  PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, description, price, stock, images, flavours } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = name || product.name;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.description = description || product.description;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.images = images || product.images;
  if (flavours !== undefined) {
    product.flavours = Array.isArray(flavours)
      ? flavours
      : typeof flavours === "string"
        ? flavours
            .split(/[\n,]/)
            .map((f) => f.trim())
            .filter(Boolean)
        : product.flavours;
  }

  const updated = await product.save();
  res.json(updated);
});

export const canReviewProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const hasDeliveredOrder = await Order.exists({
    userId: req.user._id,
    orderStatus: "delivered",
    "items.productId": product._id,
  });

  const alreadyReviewed = product.reviews.find(
    (r) => r.userId.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.json({ canReview: false, reason: "already_reviewed" });
  }
  if (!hasDeliveredOrder) {
    return res.json({ canReview: false, reason: "not_delivered" });
  }

  return res.json({ canReview: true });
});

/**
 * @desc   Delete a product (admin)
 * @route  DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json({ message: "Product removed successfully" });
});

/**
 * @desc   Add a review to product
 * @route  POST /api/products/:id/review
 * @access Private
 */
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const hasDeliveredOrder = await Order.exists({
    userId: req.user._id,
    orderStatus: "delivered",
    "items.productId": product._id,
  });
  if (!hasDeliveredOrder) {
    return res
      .status(403)
      .json({ message: "You can only review products from delivered orders" });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.userId.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) return res.status(400).json({ message: "Product already reviewed" });

  const review = {
    userId: req.user._id,
    fullName: req.user.fullName,
    comment,
    rating,
  };

  product.reviews.push(review);
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});
