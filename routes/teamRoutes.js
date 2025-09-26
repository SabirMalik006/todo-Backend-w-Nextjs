const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const teamController = require("../controllers/teamController");


router.post("/", auth, teamController.createTeam);
router.get("/", auth, teamController.getUserTeams);
router.get("/:teamId", auth, teamController.getTeam);
router.post("/:teamId/invite", auth, teamController.inviteMember);
router.put("/:teamId/members/role", auth, teamController.updateMemberRole);
router.delete("/:teamId/members", auth, teamController.removeMember);

module.exports = router;
