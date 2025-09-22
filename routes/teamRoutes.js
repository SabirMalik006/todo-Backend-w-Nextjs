const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, teamController.createTeam);
router.post("/:teamId/invite", authMiddleware, teamController.inviteMember);
router.get("/", authMiddleware, teamController.getUserTeams);
router.get("/:teamId", authMiddleware, teamController.getTeam);
router.patch("/:teamId/role", authMiddleware, teamController.updateMemberRole);
router.delete("/:teamId/member", authMiddleware, teamController.removeMember);

module.exports = router;    