const crypto = require("crypto");
const Razorpay = require("razorpay");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function generateTrackingCode() {
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `TCET-${rand}`;
}

async function createRazorpayOrder(req, res) {
  const { total } = req.body;
  if (!total || total <= 0) {
    return res.status(400).json({ error: "Total amount is required" });
  }

  const instance = getRazorpayInstance();
  const options = {
    amount: Math.round(total * 100), // convert to paise
    currency: "INR",
    payment_capture: 1,
  };

  try {
    const order = await instance.orders.create(options);
    return res.json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID   // 🔥 ADD THIS
    });
  } catch (err) {
    console.error("Razorpay Error:", err);
    return res.status(400).json({ error: "Payment Gateway Error: Invalid API keys or setup." });
  }
}

async function createOrder(req, res) {
  const {     
    paymentMethod="online",
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items: clientItems,
    subtotal,
    tax,
    total,
  } = req.body;

  if (paymentMethod === "online") {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Payment details are required for online payment" });
    }

    // Verify Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generated !== razorpaySignature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  }

  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    return res.status(400).json({ error: "Order items are required" });
  }

  // Filter out invalid IDs to prevent Mongoose crash
  const mongoose = require("mongoose");
  const validClientItems = clientItems.filter(i => mongoose.Types.ObjectId.isValid(i.menuItemId));
  
  if (validClientItems.length !== clientItems.length) {
    return res.status(400).json({ error: "One or more menu item IDs are invalid" });
  }

  // Load menu items from DB to prevent tampering
  const menuIds = validClientItems.map((i) => i.menuItemId);
  const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });

  const items = validClientItems.map((ci) => {
    const doc = menuDocs.find((m) => m._id.toString() === String(ci.menuItemId));
    if (!doc) throw new Error("Menu item not found: " + ci.menuItemId);
    return {
      menuItem: doc._id,
      name: doc.name,
      price: doc.price,
      quantity: ci.quantity,
    };
  });

  const serverSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serverTax = Math.round(serverSubtotal * 0.05);
  const serverTotal = serverSubtotal + serverTax;

  if (Number(serverTotal) !== Number(total)) {
    console.error(`Total mismatch: server=${serverTotal}, client=${total}`);
    return res.status(400).json({ error: "Total mismatch" });
  }

  const trackingCode = generateTrackingCode();
  const estimatedReadyAt = new Date(Date.now() + 10 * 60 * 1000); // +10 mins

  const orderData = {
    trackingCode,
    student: req.user.id,
    items,
    subtotal: serverSubtotal,
    tax: serverTax,
    total: serverTotal,
    status: "Pending",
    estimatedReadyAt,
    payment: {
      provider: paymentMethod === "online" ? "razorpay" : "cod",
      status: paymentMethod === "online" ? "paid" : "created",
    },
  };

  if (paymentMethod === "online") {
    orderData.payment.razorpayOrderId = razorpayOrderId;
    orderData.payment.razorpayPaymentId = razorpayPaymentId;
    orderData.payment.razorpaySignature = razorpaySignature;
  }

  const order = await Order.create(orderData);

  return res.status(201).json({
    id: order._id,
    trackingCode: order.trackingCode,
    status: order.status,
    estimatedReadyAt,
  });
}

async function getOrderByTrackingCode(req, res) {
  const { id } = req.params;
  const order = await Order.findOne({ trackingCode: id }).lean();
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  return res.json({
    trackingCode: order.trackingCode,
    status: order.status,
    estimatedReadyAt: order.estimatedReadyAt,
    createdAt: order.createdAt,
  });
}

async function getAllOrders(req, res) {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate("student", "name email")
    .lean();
  return res.json({ orders });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).lean();

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({ order });
}

async function getStudentOrders(req, res) {
  const orders = await Order.find({ student: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ orders });
}

module.exports = {
  createRazorpayOrder,
  createOrder,
  getOrderByTrackingCode,
  getAllOrders,
  getStudentOrders,
  updateOrderStatus,
};


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { total } = req.body;

    const options = {
      amount: total * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
    });

  } catch (err) {
    console.error("Razorpay error:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};