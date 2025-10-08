const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendInvite, acceptInvite, rejectInvite } = require("../controllers/inviteController");

router.post("/send", authMiddleware, sendInvite);
router.get("/accept/:token", acceptInvite);
router.get("/reject/:token", rejectInvite);

module.exports = router;
