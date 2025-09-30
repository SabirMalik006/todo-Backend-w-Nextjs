const express = require("express");
const router = express.Router();
const {
  inviteMember,
  respondInvite,
  getBoardMembers,
  removeMember,
} = require("../controllers/boardTeamController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/board/:boardId", authMiddleware, getBoardMembers);


router.post("/board/:boardId/invite", authMiddleware, inviteMember);


router.post("/invite/respond", authMiddleware, respondInvite);


router.delete("/board/:boardId/members/:memberId", authMiddleware, removeMember);

module.exports = router;
