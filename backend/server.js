// server.js
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure dotenv before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

// Now import other modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Rest of your server configuration...

// 1️⃣ Middleware
app.use(express.json());       // Parse JSON bodies
app.use(cors());               // Allow all origins (for testing, can restrict later)

// 2️⃣ Test Route (public, no auth)
app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

// 3️⃣ Routes are already imported at the top

// 4️⃣ Use routes
// Public or protected routes go here
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

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
