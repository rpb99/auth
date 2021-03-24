const express = require("express");

const { login, profile } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/profile", protect, profile);

module.exports = router;
