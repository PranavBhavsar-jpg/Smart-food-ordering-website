const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createRazorpayOrder,
  createOrder,
  getOrderByTrackingCode,
  getStudentOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

// Razorpay order
router.post("/payments/razorpay/order", requireAuth(["student"]), createRazorpayOrder);

// Create order after payment
router.post("/", requireAuth(["student"]), createOrder);

// Get student orders
router.get("/me", requireAuth(["student"]), getStudentOrders);

// Public tracking
router.get("/:id", getOrderByTrackingCode);

// Admin routes
router.get("/", requireAuth(["admin"]), getAllOrders);
router.patch("/:id/status", requireAuth(["admin"]), updateOrderStatus);

module.exports = router;