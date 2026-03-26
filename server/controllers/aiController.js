async function generateChefNote(req, res) {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Items are required" });
  }

  const itemNames = items.map((i) => i.name).join(", ");
  
  // Real implementation would call Gemini/OpenAI API here.
  // For now, we'll return a dynamic message based on categories.
  const containsBeverage = items.some(i => i.category === "Beverages");
  const containsChinese = items.some(i => i.category === "Chinese");
  
  let note = `Enjoy your ${itemNames}! `;
  if (containsBeverage) note += "Stay hydrated! 🥤 ";
  if (containsChinese) note += "Hope you have your chopsticks ready! 🥢 ";
  note += "May your code compile on the first try today! 💻";

  res.json({ note });
}

module.exports = { generateChefNote };