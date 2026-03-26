const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true }, // client-relative path (e.g. "images/vada-pav.jpg")
    desc: { type: String, required: true, trim: true },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MenuItemSchema.index({ category: 1, sortOrder: 1, name: 1 });
MenuItemSchema.index({ name: "text", desc: "text", category: "text" });

module.exports = mongoose.model("MenuItem", MenuItemSchema);

