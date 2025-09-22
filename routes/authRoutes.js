const express = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken, getMe , googleCallback , googleLogin} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", authMiddleware, getMe);

module.exports = router;
