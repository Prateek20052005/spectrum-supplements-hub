// backend/controllers/orderController.js
import asyncHandler from "express-async-handler";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";

const getFrontendBaseUrl = () => {
  return (
    process.env.FRONTEND_BASE_URL ||
    process.env.CLIENT_URL ||
    "https://suppbyksn.vercel.app"
  );
};

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
    deliveryAddress,
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
    deliveryAddress:
      deliveryAddress && typeof deliveryAddress === "object"
        ? {
            street: deliveryAddress.street,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            postalCode: deliveryAddress.postalCode,
            country: deliveryAddress.country || "India",
          }
        : undefined,
    paymentMethod,
    paymentStatus: paymentMethod === "upi" ? "pending" : "pending",
    orderStatus: "placed",
  });

  const createdOrder = await order.save();

  try {
    const userEmail = req.user?.email;
    if (userEmail) {
      const orderId = createdOrder?._id?.toString();
      const orderUrl = orderId ? `${getFrontendBaseUrl()}/order/${orderId}` : getFrontendBaseUrl();
      const itemsLine = (createdOrder?.items || [])
        .map((it) => `${it?.name || "Item"} x${it?.quantity || 1}`)
        .join(", ");

      const itemsRows = (createdOrder?.items || [])
        .map((it) => {
          const qty = Number(it?.quantity || 1);
          const price = typeof it?.price === "number" ? it.price : 0;
          const lineTotal = price * qty;
          return `<tr>
  <td style="padding:8px;border:1px solid #e5e7eb;">${it?.name || "Product"}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">${qty}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">₹${price.toFixed(2)}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">₹${lineTotal.toFixed(2)}</td>
 </tr>`;
        })
        .join("");

      await sendEmail({
        to: userEmail,
        subject: `Order Confirmation${orderId ? ` (#${orderId})` : ""}`,
        text: `Dear${req.user?.fullName ? ` ${req.user.fullName}` : " Customer"},\n\nThank you for your purchase. Your order has been successfully placed.${orderId ? `\n\nOrder ID: ${orderId}` : ""}\nOrder Status: ${createdOrder?.orderStatus || "placed"}\nOrder Total: ₹${Number(createdOrder?.totalAmount || 0).toFixed(2)}\nItems: ${itemsLine || "-"}\n\nTrack your order: ${orderUrl}\n\nRegards,\nSuppByKSN`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">Order Confirmation</h2>
  <p style="margin:0 0 12px;">Dear${req.user?.fullName ? ` ${req.user.fullName}` : " Customer"},</p>
  <p style="margin:0 0 12px;">Thank you for your purchase. Your order has been successfully placed.</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    ${orderId ? `<p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
    <p style="margin:0 0 6px;"><strong>Order Status:</strong> ${(createdOrder?.orderStatus || "placed")}</p>
    <p style="margin:0;"><strong>Order Total:</strong> ₹${Number(createdOrder?.totalAmount || 0).toFixed(2)}</p>
  </div>
  <h3 style="margin:18px 0 8px;">Order Details</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Item</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Qty</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Price</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows || ""}
    </tbody>
  </table>
  <div style="margin:18px 0;">
    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View Order</a>
  </div>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
        attachments: [
          {
            filename: "ksn-banner.jpg",
            path: "../frontend/public/ksn-banner.jpg",
            cid: "ksn-banner",
          },
        ],
      });
    }
  } catch (e) {
    console.warn("Failed to send order placed email:", e?.message || e);
  }

  // Notify admins of the new order
  try {
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    if (adminEmails.length) {
      const orderId = createdOrder?._id?.toString();
      const orderUrl = orderId ? `${getFrontendBaseUrl()}/order/${orderId}` : getFrontendBaseUrl();
      const itemsLine = (createdOrder?.items || [])
        .map((it) => `${it?.name || "Item"} x${it?.quantity || 1}`)
        .join(", ");

      await sendEmail({
        to: adminEmails, // nodemailer supports array of recipients
        subject: `New Order Placed${orderId ? ` (#${orderId})` : ""}`,
        text: `A new order has been placed by ${req.user?.fullName || "A customer"} (${req.user?.email}).${orderId ? `\n\nOrder ID: ${orderId}` : ""}\nOrder Status: ${createdOrder?.orderStatus || "placed"}\nOrder Total: ₹${Number(createdOrder?.totalAmount || 0).toFixed(2)}\nItems: ${itemsLine || "-"}\n\nView order: ${orderUrl}\n\nRegards,\nSuppByKSN`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">New Order Placed</h2>
  <p style="margin:0 0 12px;">A new order has been placed by <strong>${req.user?.fullName || "A customer"}</strong> (${req.user?.email}).</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    ${orderId ? `<p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
    <p style="margin:0 0 6px;"><strong>Order Status:</strong> ${(createdOrder?.orderStatus || "placed")}</p>
    <p style="margin:0;"><strong>Order Total:</strong> ₹${Number(createdOrder?.totalAmount || 0).toFixed(2)}</p>
  </div>
  <h3 style="margin:18px 0 8px;">Order Details</h3>
  <p style="margin:0 0 12px;">${itemsLine || "-"}</p>
  <div style="margin:18px 0;">
    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View Order</a>
  </div>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
        attachments: [
          {
            filename: "ksn-banner.jpg",
            path: "../frontend/public/ksn-banner.jpg",
            cid: "ksn-banner",
          },
        ],
      });
    }
  } catch (e) {
    console.warn("Failed to send admin new order email:", e?.message || e);
  }

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

  // Send cancellation email to the user and notify admins
  try {
    const orderWithUser = await Order.findById(updated._id).populate("userId", "fullName email");
    const userEmail = orderWithUser?.userId?.email;
    const orderId = updated?._id?.toString();
    const orderUrl = orderId ? `${getFrontendBaseUrl()}/order/${orderId}` : getFrontendBaseUrl();
    const itemsLine = (orderWithUser?.items || [])
      .map((it) => `${it?.name || "Item"} x${it?.quantity || 1}`)
      .join(", ");

    // Send to user
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: `Order Cancelled${orderId ? ` (#${orderId})` : ""}`,
        text: `Dear${orderWithUser?.userId?.fullName ? ` ${orderWithUser.userId.fullName}` : " Customer"},\n\nYour order has been successfully cancelled.${orderId ? `\n\nOrder ID: ${orderId}` : ""}\nOrder Status: ${updated.orderStatus}\nOrder Total: ₹${Number(updated?.totalAmount || 0).toFixed(2)}\nItems: ${itemsLine || "-"}\n\nIf you did not request this cancellation, please contact our support team immediately.\n\nView your order: ${orderUrl}\n\nRegards,\nSuppByKSN`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">Order Cancelled</h2>
  <p style="margin:0 0 12px;">Dear${orderWithUser?.userId?.fullName ? ` ${orderWithUser.userId.fullName}` : " Customer"},</p>
  <p style="margin:0 0 12px;">Your order has been successfully cancelled.</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    ${orderId ? `<p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
    <p style="margin:0 0 6px;"><strong>Order Status:</strong> ${updated.orderStatus}</p>
    <p style="margin:0;"><strong>Order Total:</strong> ₹${Number(updated?.totalAmount || 0).toFixed(2)}</p>
  </div>
  <h3 style="margin:18px 0 8px;">Cancelled Items</h3>
  <p style="margin:0 0 12px;">${itemsLine || "-"}</p>
  <p style="margin:0 0 12px;">If you did not request this cancellation, please contact our support team immediately.</p>
  <div style="margin:18px 0;">
    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View Order</a>
  </div>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
        attachments: [
          {
            filename: "ksn-banner.jpg",
            path: "../frontend/public/ksn-banner.jpg",
            cid: "ksn-banner",
          },
        ],
      });
    }

    // Notify admins
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    if (adminEmails.length) {
      await sendEmail({
        to: adminEmails,
        subject: `Order Cancelled${orderId ? ` (#${orderId})` : ""}`,
        text: `An order has been cancelled by ${orderWithUser?.userId?.fullName || "A customer"} (${orderWithUser?.userId?.email}).${orderId ? `\n\nOrder ID: ${orderId}` : ""}\nOrder Status: ${updated.orderStatus}\nOrder Total: ₹${Number(updated?.totalAmount || 0).toFixed(2)}\nItems: ${itemsLine || "-"}\n\nView order: ${orderUrl}\n\nRegards,\nSuppByKSN`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">Order Cancelled</h2>
  <p style="margin:0 0 12px;">An order has been cancelled by <strong>${orderWithUser?.userId?.fullName || "A customer"}</strong> (${orderWithUser?.userId?.email}).</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    ${orderId ? `<p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
    <p style="margin:0 0 6px;"><strong>Order Status:</strong> ${updated.orderStatus}</p>
    <p style="margin:0;"><strong>Order Total:</strong> ₹${Number(updated?.totalAmount || 0).toFixed(2)}</p>
  </div>
  <h3 style="margin:18px 0 8px;">Cancelled Items</h3>
  <p style="margin:0 0 12px;">${itemsLine || "-"}</p>
  <div style="margin:18px 0;">
    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View Order</a>
  </div>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
        attachments: [
          {
            filename: "ksn-banner.jpg",
            path: "../frontend/public/ksn-banner.jpg",
            cid: "ksn-banner",
          },
        ],
      });
    }
  } catch (e) {
    console.warn("Failed to send order cancellation emails:", e?.message || e);
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

  const previousStatus = order.orderStatus;
  order.orderStatus = req.body.orderStatus || order.orderStatus;
  const updated = await order.save();

  if (previousStatus !== updated.orderStatus) {
    try {
      const orderWithUser = await Order.findById(updated._id).populate("userId", "fullName email");
      const userEmail = orderWithUser?.userId?.email;
      if (userEmail) {
        const orderId = updated?._id?.toString();
        const orderUrl = orderId ? `${getFrontendBaseUrl()}/order/${orderId}` : getFrontendBaseUrl();
        const itemsLine = (orderWithUser?.items || [])
          .map((it) => `${it?.name || "Item"} x${it?.quantity || 1}`)
          .join(", ");

        const itemsRows = (orderWithUser?.items || [])
          .map((it) => {
            const qty = Number(it?.quantity || 1);
            const price = typeof it?.price === "number" ? it.price : 0;
            const lineTotal = price * qty;
            return `<tr>
  <td style="padding:8px;border:1px solid #e5e7eb;">${it?.name || "Product"}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">${qty}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">₹${price.toFixed(2)}</td>
  <td style="padding:8px;border:1px solid #e5e7eb;">₹${lineTotal.toFixed(2)}</td>
 </tr>`;
          })
          .join("");

        await sendEmail({
          to: userEmail,
          subject: `Order Status Update${orderId ? ` (#${orderId})` : ""}`,
          text: `Dear${orderWithUser?.userId?.fullName ? ` ${orderWithUser.userId.fullName}` : " Customer"},\n\nWe would like to inform you that the status of your order has been updated.${orderId ? `\n\nOrder ID: ${orderId}` : ""}\nPrevious Status: ${previousStatus}\nNew Status: ${updated.orderStatus}\nOrder Total: ₹${Number(updated?.totalAmount || 0).toFixed(2)}\nItems: ${itemsLine || "-"}\n\nView your order: ${orderUrl}\n\nRegards,\nSuppByKSN`,
          html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">Order Status Update</h2>
  <p style="margin:0 0 12px;">Dear${orderWithUser?.userId?.fullName ? ` ${orderWithUser.userId.fullName}` : " Customer"},</p>
  <p style="margin:0 0 12px;">We would like to inform you that the status of your order has been updated.</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    ${orderId ? `<p style="margin:0 0 6px;"><strong>Order ID:</strong> ${orderId}</p>` : ""}
    <p style="margin:0 0 6px;"><strong>Previous Status:</strong> ${previousStatus}</p>
    <p style="margin:0 0 6px;"><strong>New Status:</strong> ${updated.orderStatus}</p>
    <p style="margin:0;"><strong>Order Total:</strong> ₹${Number(updated?.totalAmount || 0).toFixed(2)}</p>
  </div>
  <h3 style="margin:18px 0 8px;">Order Details</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <thead>
      <tr>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Item</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Qty</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Price</th>
        <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;background:#f3f4f6;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows || ""}
    </tbody>
  </table>
  <div style="margin:18px 0;">
    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:6px;">View Order</a>
  </div>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
          attachments: [
            {
              filename: "ksn-banner.jpg",
              path: "../frontend/public/ksn-banner.jpg",
              cid: "ksn-banner",
            },
          ],
        });
      }
    } catch (e) {
      console.warn("Failed to send order status update email:", e?.message || e);
    }
  }

  res.json(updated);
});
