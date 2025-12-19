// backend/controllers/orderController.js
import asyncHandler from "express-async-handler";
import Order from "../models/order.js";
import Product from "../models/product.js";

/**
 * @desc   Create a new order
 * @route  POST /api/orders
 * @access Private
 * body: { items: [{productId, quantity, price, name}], totalAmount, paymentMethod }
 */
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    items,
    totalAmount,
    paymentMethod,
    // tolerate older frontend payloads
    orderItems,
    totalPrice,
  } = req.body;

  const normalizedItems = Array.isArray(items) ? items : Array.isArray(orderItems) ? orderItems : [];
  const normalizedTotal =
    typeof totalAmount === "number" ? totalAmount : typeof totalPrice === "number" ? totalPrice : undefined;

  if (!normalizedItems || normalizedItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  if (typeof normalizedTotal !== "number" || Number.isNaN(normalizedTotal)) {
    return res.status(400).json({ message: "Invalid totalAmount" });
  }

  // check stock
  for (const it of normalizedItems) {
    const prod = await Product.findById(it.productId);
    if (!prod) return res.status(404).json({ message: `Product ${it.name || it.productId} not found` });
    if (prod.stock < it.quantity) return res.status(400).json({ message: `Insufficient stock for ${prod.name}` });
  }

  const order = new Order({
    userId: req.user._id,
    items: normalizedItems,
    totalAmount: normalizedTotal,
    paymentMethod,
    paymentStatus: paymentMethod === "upi" ? "pending" : "pending",
    orderStatus: "placed",
  });

  const createdOrder = await order.save();

  // decrement stock and optionally increment sold count
  for (const it of normalizedItems) {
    await Product.findByIdAndUpdate(it.productId, {
      $inc: { stock: -it.quantity },
    });
  }

  res.status(201).json(createdOrder);
});

/**
 * @desc   Get order by ID
 * @route  GET /api/orders/:id
 * @access Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("userId", "fullName email");
  if (order) res.json(order);
  else res.status(404).json({ message: "Order not found" });
});

/**
 * @desc   Get logged in user's orders
 * @route  GET /api/orders/myorders
 * @access Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id });
  res.json(orders);
});

/**
 * @desc   Get all orders (admin)
 * @route  GET /api/orders
 * @access Private/Admin
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("userId", "fullName email");
  res.json(orders);
});

/**
 * @desc   Update order to paid
 * @route  PUT /api/orders/:id/pay
 * @access Private
 */
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.paymentStatus = "paid";
  order.paymentMethod = req.body.paymentMethod || order.paymentMethod;
  order.updatedAt = Date.now();

  const updated = await order.save();
  res.json(updated);
});

/**
 * @desc   Cancel an order (customer)
 * @route  PUT /api/orders/:id/cancel
 * @access Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  // Only the owner (or admin) can cancel
  const isOwner = order.userId?.toString() === req.user._id.toString();
  const isAdmin = req.user?.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not authorized to cancel this order" });
  }

  if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
    return res.status(400).json({ message: "Order cannot be cancelled after it has been shipped" });
  }

  order.orderStatus = "cancelled";
  const updated = await order.save();

  // Restock items
  for (const it of order.items || []) {
    await Product.findByIdAndUpdate(it.productId, {
      $inc: { stock: it.quantity },
    });
  }

  res.json(updated);
});

/**
 * @desc   Update order status (admin) e.g., shipped/delivered
 * @route  PUT /api/orders/:id/status
 * @access Private/Admin
 * body: { orderStatus }
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.orderStatus = req.body.orderStatus || order.orderStatus;
  const updated = await order.save();
  res.json(updated);
});
