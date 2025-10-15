// backend/routes/orderRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, addOrderItems);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, updateOrderToPaid);

// admin
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
