const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createTeam, inviteMember, getUserTeams, getTeam, updateMemberRole, removeMember } = require("../controllers/teamController");
const { acceptInvite, rejectInvite } = require("../controllers/inviteController");

router.use(authMiddleware);

router.post("/", createTeam);
router.get("/my-teams", getUserTeams);
router.get("/:teamId", getTeam);
router.post("/:teamId/invite", inviteMember);
router.post("/accept-invite", acceptInvite);
router.post("/reject-invite", rejectInvite);
router.patch("/:teamId/member-role", updateMemberRole);
router.patch("/:teamId/remove-member", removeMember);

module.exports = router;
