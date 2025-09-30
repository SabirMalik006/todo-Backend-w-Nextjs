
const express = require("express");
const router = express.Router();
const { getBoardActivities } = require("../controllers/activityController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/boards/:id/activities", authMiddleware, getBoardActivities);

module.exports = router;
