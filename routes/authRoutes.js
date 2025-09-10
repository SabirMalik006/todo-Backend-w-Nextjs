import express from "express";
import { getMe, registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);

router.get("/me", authMiddleware, getMe);

export default  router;
