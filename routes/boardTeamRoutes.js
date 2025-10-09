const express = require("express");
const router = express.Router();
const {
  inviteMember,
  respondInvite,
  getBoardMembers,
  removeMember,
  acceptInvite,
  rejectInvite
} = require("../controllers/boardTeamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/board/:boardId/invite", authMiddleware, inviteMember);
router.get("/board/:boardId/members", authMiddleware, getBoardMembers);
router.delete("/board/:boardId/member/:memberId", authMiddleware, removeMember);
router.post("/invite/accept", acceptInvite);
router.post("/invite/reject", rejectInvite);
router.get("/invite/respond", respondInvite);

module.exports = router;