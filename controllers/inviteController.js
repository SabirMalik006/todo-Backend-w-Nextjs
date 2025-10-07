const Invite = require("../models/InviteModal");
const Team = require("../models/TeamModal");
const User = require("../models/userModels");
const Board = require("../models/BoardModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.sendInvite = async (req, res) => {
  try {
    const { email, teamId } = req.body;
    const inviterId = req.userId;

    if (!email || !teamId) {
      return res.status(400).json({ message: "Email and teamId are required" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const token = crypto.randomBytes(32).toString("hex");

    const invite = new Invite({
      email,
      teamId,
      invitedBy: inviterId,
      token,
    });
    await invite.save();

    const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;
    const subject = `You're invited to join ${team.name}`;
    const message = `
      <p>Hi there,</p>
      <p>You’ve been invited to join the <strong>${team.name}</strong> team on Todo App.</p>
      <p>Click below to accept or ignore:</p>
      <a href="${inviteLink}" style="color:#2B1887;font-weight:bold;">Accept Invite</a>
      <p>This invite will expire in 7 days.</p>
    `;

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
    if (!invite)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (invite.status !== "pending")
      return res
        .status(400)
        .json({ message: "Invite already used or rejected" });

    if (invite.expiresAt < Date.now())
      return res.status(400).json({ message: "Invite expired" });

    const team = await Team.findById(invite.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // ✅ Add user to team if not already present
    const alreadyInTeam = team.members.some(
      (m) => m.userId.toString() === userId.toString()
    );

    if (!alreadyInTeam) {
      team.members.push({ userId, role: "member" });
      await team.save();
    }

    // ✅ Add user to all boards owned by this team owner
    const boards = await Board.find({ owner: team.owner });
    for (const board of boards) {
      const alreadyInBoard = board.team.some(
        (member) => member.user.toString() === userId.toString()
      );
      if (!alreadyInBoard) {
        board.team.push({ user: userId, role: "member" });
        await board.save();
      }
    }

    // ✅ Mark invite as accepted
    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted. You’ve joined the team and related boards!" });
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
