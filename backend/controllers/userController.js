// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

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

  const user = await User.create({
    fullName,
    email,
    password: hashed,
    phone,
    address:
      typeof address === "string"
        ? { street: address, country: "India" }
        : address,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
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
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
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
