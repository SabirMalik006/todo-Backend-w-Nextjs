const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const inviteController = require("../controllers/inviteController");


router.post("/", auth, inviteController.sendInvite);


router.get("/my", auth, inviteController.getMyInvites);


router.post("/:inviteId/accept", auth, inviteController.acceptInvite);


router.post("/:inviteId/reject", auth, inviteController.rejectInvite);


router.delete("/:inviteId", auth, inviteController.cancelInvite);

module.exports = router;
