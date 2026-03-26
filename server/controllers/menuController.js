const MenuItem = require("../models/MenuItem");

async function getMenu(req, res) {
  const items = await MenuItem.find({ isAvailable: true })
    .sort({ sortOrder: 1, name: 1 })
    .select({ __v: 0 })
    .lean();

  res.json({ items });
}

async function getCategories(req, res) {
  try {
    const categories = await MenuItem.distinct("category", { isAvailable: true });

    res.json({ categories }); // ✅ clean response
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}
module.exports = { getMenu, getCategories };

