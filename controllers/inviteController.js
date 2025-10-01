const Invite = require("../models/InviteModal");
const Team = require("../models/TeamModal");
const User = require("../models/userModels");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // ✅ SendGrid-based

exports.sendInvite = async (req, res) => {
  try {
    const { email, teamId } = req.body;
    const inviterId = req.userId;

    if (!email || !teamId) {
      return res.status(400).json({ message: "Email and teamId are required" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // ✅ Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Create invite record
    const invite = new Invite({
      email,
      teamId,
      invitedBy: inviterId,
      token,
    });
    await invite.save();

    // ✅ Create invite link & message
    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;
    const subject = `You're invited to join ${team.name}`;
    const message = `
      <p>Hi there,</p>
      <p>You’ve been invited to join the <strong>${team.name}</strong> team on Todo App.</p>
      <p>Click below to accept or ignore:</p>
      <a href="${inviteLink}" style="color:#2B1887;font-weight:bold;">Accept Invite</a>
      <p>This invite will expire in 7 days.</p>
    `;

    // ✅ Send email using SendGrid util
    await sendEmail({
      to: email,
      subject,
      html: message,
    });

    res.status(201).json({ message: "Invite sent successfully" });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ message: "Server error sending invite" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId;

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(400).json({ message: "Invalid or expired token" });

    if (invite.status !== "pending")
      return res.status(400).json({ message: "Invite already used or rejected" });

    if (invite.expiresAt < Date.now())
      return res.status(400).json({ message: "Invite expired" });

    const team = await Team.findById(invite.teamId);
    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted. You’ve joined the team!" });
  } catch (error) {
    console.error("Accept Invite Error:", error);
    res.status(500).json({ message: "Server error accepting invite" });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(400).json({ message: "Invalid invite" });

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invite rejected" });
  } catch (error) {
    console.error("Reject Invite Error:", error);
    res.status(500).json({ message: "Server error rejecting invite" });
  }
};
