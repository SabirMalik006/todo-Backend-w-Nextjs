const Team = require("../models/TeamModal");
const User = require("../models/userModels");
const Invite = require("../models/InviteModal");
const crypto = require("crypto");

async function getMemberRole(team, userId) {
  const member = team.members.find(m => m.userId.toString() === userId.toString());
  return member ? member.role : null;
}

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.userId;

    const team = await Team.create({
      name,
      description,
      owner: ownerId,
      members: [{ userId: ownerId, role: "owner" }]
    });

    await User.findByIdAndUpdate(ownerId, { $push: { teams: team._id } });

    res.status(201).json(team);
  } catch (err) {
    console.error("CreateTeam Error:", err);
    res.status(500).json({ message: err.message || "Error creating team" });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { teamId } = req.params;
    const inviterId = req.userId;
    const sendEmail = require("../config/sendEmail");

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const inviterRole = await getMemberRole(team, inviterId);
    if (!["owner", "admin"].includes(inviterRole)) {
      return res.status(403).json({ message: "Not authorized to invite" });
    }

    if (role === "owner") {
      return res.status(403).json({ message: "Cannot invite as owner. Transfer ownership instead." });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await Invite.create({
      teamId,
      email,
      role: role || "member",
      token,
      expiresAt,
      invitedBy: inviterId,
      status: "pending",
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;

    await sendEmail({
      to: email,
      subject: `You are invited to join team ${team.name}`,
      html: `
        <h2>Hello,</h2>
        <p>You have been invited to join the team <b>${team.name}</b> as <b>${role || "member"}</b>.</p>
        <p>Click below to accept or reject the invite:</p>
        <a href="${inviteLink}" style="padding:10px 20px;background:#2B1887;color:white;text-decoration:none;">Accept Invite</a>
        <br/><br/>
        <p>If you don’t want to join, you can ignore this email.</p>
      `,
    });

    res.json({
      message: "Invite created and email sent. Waiting for user to accept.",
      teamId,
      email,
      role,
      token
    });

  } catch (err) {
    console.error("InviteMember Error:", err);
    res.status(500).json({ message: err.message || "Error inviting user" });
  }
};

exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const teams = await Team.find({ "members.userId": userId }).populate("members.userId", "name email");
    res.json(teams);
  } catch (err) {
    console.error("GetUserTeams Error:", err);
    res.status(500).json({ message: err.message || "Error getting teams" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate("members.userId", "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    console.error("GetTeam Error:", err);
    res.status(500).json({ message: err.message || "Error fetching team" });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: targetUserId, role } = req.body;
    const actorId = req.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const actorRole = await getMemberRole(team, actorId);
    if (!["owner", "admin"].includes(actorRole)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (role === "owner" && actorRole !== "owner") {
      return res.status(403).json({ message: "Only current owner can assign owner" });
    }

    const member = team.members.find(m => m.userId.toString() === targetUserId);
    if (!member) return res.status(404).json({ message: "User not in team" });

    if (role === "owner") {
      const currentOwner = team.members.find(m => m.role === "owner");
      if (currentOwner) currentOwner.role = "admin";
    }

    member.role = role;
    await team.save();

    res.json({ message: "Role updated", team });
  } catch (err) {
    console.error("UpdateMemberRole Error:", err);
    res.status(500).json({ message: err.message || "Error updating role" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: targetUserId } = req.body;
    const actorId = req.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const actorRole = await getMemberRole(team, actorId);
    if (!["owner", "admin"].includes(actorRole)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const targetMember = team.members.find(m => m.userId.toString() === targetUserId);
    if (!targetMember) return res.status(404).json({ message: "User not in team" });
    if (targetMember.role === "owner") {
      return res.status(403).json({ message: "Cannot remove owner" });
    }

    if (team.members.length === 1) {
      return res.status(400).json({ message: "Cannot remove the last member of the team" });
    }

    team.members = team.members.filter(m => m.userId.toString() !== targetUserId);
    await team.save();

    await User.findByIdAndUpdate(targetUserId, { $pull: { teams: team._id } });

    res.json({ message: "Member removed", team });
  } catch (err) {
    console.error("RemoveMember Error:", err);
    res.status(500).json({ message: err.message || "Error removing member" });
  }
};
