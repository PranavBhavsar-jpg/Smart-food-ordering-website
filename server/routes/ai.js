const express = require("express");
const { generateChefNote } = require("../controllers/aiController");

const router = express.Router();

router.post("/chef-note", (req, res, next) => {
  Promise.resolve(generateChefNote(req, res)).catch(next);
});

module.exports = router;