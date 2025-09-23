const Team = require("../models/TeamModal");
const User = require("../models/userModels");
const Invite = require("../models/InviteModal");

exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.expiresAt < Date.now()) return res.status(400).json({ message: "Invite expired" });
    if (invite.status !== "pending") return res.status(400).json({ message: "Invite already processed" });

    const team = await Team.findById(invite.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const already = team.members.some(m => m.userId.toString() === userId.toString());
    if (already) return res.status(400).json({ message: "Already a member" });

    team.members.push({ userId, role: invite.role });
    await team.save();

    await User.findByIdAndUpdate(userId, { $push: { teams: team._id } });

    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting invite" });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.status !== "pending") return res.status(400).json({ message: "Invite already processed" });

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invite rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting invite" });
  }
};
