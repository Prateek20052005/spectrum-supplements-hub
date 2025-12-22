// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const createEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  return { token, tokenHash, expires };
};

const getFrontendBaseUrl = () => {
  return (
    process.env.FRONTEND_BASE_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  );
};

const sendVerificationEmail = async ({ email, fullName, token }) => {
  const url = `${getFrontendBaseUrl()}/verify-email?token=${encodeURIComponent(
    token
  )}&email=${encodeURIComponent(email)}`;

  const subject = "Verify your email";
  const text = `Hi ${fullName || ""}\n\nPlease verify your email by opening this link:\n${url}\n\nIf you did not create an account, you can ignore this email.`;
  const html = `<p>Hi ${fullName || ""}</p><p>Please verify your email by opening this link:</p><p><a href="${url}">${url}</a></p><p>If you did not create an account, you can ignore this email.</p>`;

  await sendEmail({ to: email, subject, text, html });
};

/**
 * @desc   Register a new user
 * @route  POST /api/users/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const { token, tokenHash, expires } = createEmailVerificationToken();

  const user = await User.create({
    fullName,
    email,
    password: hashed,
    phone,
    address:
      typeof address === "string"
        ? { street: address, country: "India" }
        : address,
    emailVerified: false,
    emailVerificationToken: tokenHash,
    emailVerificationExpires: expires,
  });

  if (user) {
    await sendVerificationEmail({
      email: user.email,
      fullName: user.fullName,
      token,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      message: "Registration successful. Please verify your email.",
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

/**
 * @desc   Auth user & get token (login)
 * @route  POST /api/users/login
 * @access Public
 */
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.role !== "admin" && !user.emailVerified) {
      return res
        .status(403)
        .json({ message: "Email not verified", code: "EMAIL_NOT_VERIFIED" });
    }

    // Send login notification email (non-blocking)
    try {
      const loginTime = new Date().toISOString();
      const ipAddress =
        (req.headers["x-forwarded-for"] || "")?.toString().split(",")[0].trim() ||
        req.ip ||
        "Unknown";

      await sendEmail({
        to: user.email,
        subject: "Login Alert: New sign-in to your account",
        text: `Dear ${user.fullName || "Customer"},\n\nWe noticed a new sign-in to your SuppByKSN account using this email address (${user.email}).\n\nTime (UTC): ${loginTime}\nIP address: ${ipAddress}\n\nIf this was you, no further action is required.\nIf you did not sign in, please secure your account immediately by changing your password.\n\nRegards,\nSuppByKSN`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;">
  <div style="margin-bottom:16px;">
    <img src="cid:ksn-banner" alt="SuppByKSN" style="width:100%;height:auto;border-radius:8px;display:block;" />
  </div>
  <h2 style="margin:0 0 12px;">Login Alert</h2>
  <p style="margin:0 0 12px;">Dear ${user.fullName || "Customer"},</p>
  <p style="margin:0 0 12px;">We noticed a new sign-in to your SuppByKSN account using this email address (<strong>${user.email}</strong>).</p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;">
    <p style="margin:0 0 6px;"><strong>Time (UTC):</strong> ${loginTime}</p>
    <p style="margin:0;"><strong>IP address:</strong> ${ipAddress}</p>
  </div>
  <p style="margin:0 0 12px;">If this was you, no further action is required.</p>
  <p style="margin:0 0 12px;"><strong>If you did not sign in</strong>, please secure your account immediately by changing your password.</p>
  <p style="margin:0;">Regards,<br/>SuppByKSN</p>
 </div>`,
        attachments: [
          {
            filename: "ksn-banner.jpg",
            path: "frontend\public\ksn-banner.jpg",
            cid: "ksn-banner",
          },
        ],
      });
    } catch (e) {
      console.warn("Failed to send login notification email:", e?.message || e);
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;
  const email = req.query.email || req.body.email;

  if (!token || !email) {
    return res.status(400).json({ message: "Missing token or email" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.emailVerified) {
    return res.json({ message: "Email already verified" });
  }

  if (!user.emailVerificationToken || !user.emailVerificationExpires) {
    return res.status(400).json({ message: "Verification token not found" });
  }

  if (user.emailVerificationExpires.getTime() < Date.now()) {
    return res.status(400).json({ message: "Verification token expired" });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");

  if (tokenHash !== user.emailVerificationToken) {
    return res.status(400).json({ message: "Invalid verification token" });
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return res.json({ message: "Email verified" });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.emailVerified) {
    return res.json({ message: "Email already verified" });
  }

  const { token, tokenHash, expires } = createEmailVerificationToken();
  user.emailVerificationToken = tokenHash;
  user.emailVerificationExpires = expires;
  await user.save();

  await sendVerificationEmail({
    email: user.email,
    fullName: user.fullName,
    token,
  });

  return res.json({ message: "Verification email sent" });
});

/**
 * @desc   Get user profile
 * @route  GET /api/users/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) res.json(user);
  else res.status(404).json({ message: "User not found" });
});

/**
 * @desc   Update logged in user profile
 * @route  PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.fullName = req.body.fullName || user.fullName;
  user.phone = req.body.phone || user.phone;

  if (req.body.address !== undefined) {
    user.address =
      typeof req.body.address === "string"
        ? { street: req.body.address, country: "India" }
        : {
            ...(user.address?.toObject?.() || user.address || {}),
            ...req.body.address,
          };
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address,
    token: generateToken(updatedUser._id),
  });
});

/**
 * @desc   Get all users (admin)
 * @route  GET /api/users
 * @access Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/**
 * @desc   Delete user (admin)
 * @route  DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

/**
 * @desc   Get user by ID (admin)
 * @route  GET /api/users/:id
 * @access Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) res.json(user);
  else res.status(404).json({ message: "User not found" });
});

/**
 * @desc   Update user (admin)
 * @route  PUT /api/users/:id
 * @access Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.fullName = req.body.fullName || user.fullName;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;

  await user.save();
  res.json({ message: "User updated" });
});
