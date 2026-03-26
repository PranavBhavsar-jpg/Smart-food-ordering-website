const express = require("express");
const { getMenu, getCategories } = require("../controllers/menuController");

const router = express.Router();

router.get("/", (req, res, next) => {
  Promise.resolve(getMenu(req, res)).catch(next);
});

router.get("/categories", (req, res, next) => {
  Promise.resolve(getCategories(req, res)).catch(next);
});

module.exports = router;

