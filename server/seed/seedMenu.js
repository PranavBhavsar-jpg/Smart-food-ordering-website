const MenuItem = require("../models/MenuItem");

async function seedMenuIfEmpty() {
  const count = await MenuItem.estimatedDocumentCount();
  // Restore original menu (12 items) if the current menu is different (e.g., the broken 35 items)
  if (count === 12) return { seeded: false, count };

  await MenuItem.deleteMany({});

  const items = [
    {
      name: "Vada Pav",
      price: 15,
      category: "Snacks",
      image: "images/vada-pav.jpg",
      desc: "Classic Mumbai burger with spicy chutney",
      sortOrder: 1,
    },
    {
      name: "Samosa Pav",
      price: 18,
      category: "Snacks",
      image: "images/samosa.jpg",
      desc: "Crispy samosa served inside a pav",
      sortOrder: 2,
    },
    {
      name: "Masala Chai",
      price: 10,
      category: "Beverages",
      image: "images/masala-chai.jpg",
      desc: "Hot refreshing tea with spices",
      sortOrder: 3,
    },
    {
      name: "Cold Coffee",
      price: 35,
      category: "Beverages",
      image: "images/cold-coffee.jpg",
      desc: "Chilled coffee with chocolate topping",
      sortOrder: 4,
    },
    {
      name: "Veg Schezwan Frankie",
      price: 50,
      category: "Snacks",
      image: "images/frankie.jpg",
      desc: "Spicy schezwan vegetable roll",
      sortOrder: 5,
    },
    {
      name: "Cheese Frankie",
      price: 60,
      category: "Snacks",
      image: "images/frankie.jpg",
      desc: "Loaded with cheese and veggies",
      sortOrder: 6,
    },
    {
      name: "Veg Hakka Noodles",
      price: 80,
      category: "Chinese",
      image: "images/hakka-noodles.jpg",
      desc: "Stir-fried noodles with veggies",
      sortOrder: 7,
    },
    {
      name: "Veg Fried Rice",
      price: 75,
      category: "Chinese",
      image: "images/fried-rice.jpg",
      desc: "Classic chinese fried rice",
      sortOrder: 8,
    },
    {
      name: "Mini Thali",
      price: 60,
      category: "Lunch",
      image: "images/mini-thali.jpg",
      desc: "3 Roti, Sabzi, Dal, Rice, Pickle",
      sortOrder: 9,
    },
    {
      name: "Chole Bhature",
      price: 70,
      category: "Lunch",
      image: "images/chole-bhature.jpg",
      desc: "Spicy chole with 2 fluffy bhaturas",
      sortOrder: 10,
    },
    {
      name: "Idli Sambhar",
      price: 40,
      category: "Snacks",
      image: "images/idli-sambhar.jpg",
      desc: "2 Idlis with coconut chutney & sambhar",
      sortOrder: 11,
    },
    {
      name: "Medu Vada",
      price: 45,
      category: "Snacks",
      image: "images/medu-vada.jpg",
      desc: "Crispy dal vadas with chutney",
      sortOrder: 12,
    },
  ];

  {
    // Add missing sortOrder for existing items (e.g., the broken 35 items)
    const existingItems = await MenuItem.find().sort({ sortOrder: 1 });
    for (let i = 0; i < existingItems.length; i++) {
      if (!existingItems[i].sortOrder) {
        existingItems[i].sortOrder = i + 1;
        await existingItems[i].save();
      }
    }
  }

  await MenuItem.insertMany(items);
  return { seeded: true, count: items.length };
}

module.exports = { seedMenuIfEmpty };
