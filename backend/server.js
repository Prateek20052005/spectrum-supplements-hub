// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// 1️⃣ Middleware
app.use(express.json());       // Parse JSON bodies
app.use(cors());               // Allow all origins (for testing, can restrict later)

// 2️⃣ Test Route (public, no auth)
app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

// 3️⃣ Import your routes
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// 4️⃣ Use routes
// Public or protected routes go here
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// 5️⃣ 404 handler (optional)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 6️⃣ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 7️⃣ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
