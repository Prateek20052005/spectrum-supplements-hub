// backend/routes/orderRoutes.js
import express from "express";
import { protect, admin, verified } from "../middleware/authMiddleware.js";
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, verified, addOrderItems);
router.get("/myorders", protect, verified, getMyOrders);
router.get("/:id", protect, verified, getOrderById);
router.put("/:id/pay", protect, verified, updateOrderToPaid);
router.put("/:id/cancel", protect, verified, cancelOrder);

// admin
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
