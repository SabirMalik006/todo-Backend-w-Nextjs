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
    res.status(500).json({ message: "Error creating team" });
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
    // await sendInviteEmail({ to: email, teamName: team.name, token });

    res.json({ message: "Invite created. Waiting for user to accept.", teamId, email, role , token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error inviting user" });
  }
};

exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.userId;
    const teams = await Team.find({ "members.userId": userId }).populate("members.userId", "name email");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error getting teams" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate("members.userId", "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Error fetching team" });
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
    if (!["owner","admin"].includes(actorRole)) return res.status(403).json({ message: "Not allowed" });

    if (role === "owner" && actorRole !== "owner") return res.status(403).json({ message: "Only owner can assign owner" });

    const member = team.members.find(m => m.userId.toString() === targetUserId);
    if (!member) return res.status(404).json({ message: "User not in team" });

    member.role = role;
    await team.save();
    res.json({ message: "Role updated", team });
  } catch (err) {
    res.status(500).json({ message: "Error updating role" });
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
    if (!["owner","admin"].includes(actorRole)) return res.status(403).json({ message: "Not allowed" });

    const targetMember = team.members.find(m => m.userId.toString() === targetUserId);
    if (!targetMember) return res.status(404).json({ message: "User not in team" });
    if (targetMember.role === "owner") return res.status(403).json({ message: "Cannot remove owner" });

    team.members = team.members.filter(m => m.userId.toString() !== targetUserId);
    await team.save();
    await User.findByIdAndUpdate(targetUserId, { $pull: { teams: team._id } });

    res.json({ message: "Member removed", team });
  } catch (err) {
    res.status(500).json({ message: "Error removing member" });
  }
};
