// backend/routes/cartRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/", protect, clearCart);
router.delete("/:productId", protect, removeFromCart);

export default router;
