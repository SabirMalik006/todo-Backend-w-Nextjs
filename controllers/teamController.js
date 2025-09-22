const Team = require("../models/Team");
const User = require("../models/userModels");
const Invite = require("../models/Invite"); 
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

    // save team id in user record
    await User.findByIdAndUpdate(ownerId, { $push: { teams: team._id } });

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating team" });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body; // role: "member" | "admin" | "viewer"
    const { teamId } = req.params;
    const inviterId = req.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const inviterRole = await getMemberRole(team, inviterId);
    if (!["owner","admin"].includes(inviterRole)) {
      return res.status(403).json({ message: "Not authorized to invite" });
    }

    // Prevent inviter from assigning role higher than them (owner only can assign owner)
    if (role === "admin" && inviterRole !== "owner" && inviterRole !== "admin") {
      return res.status(403).json({ message: "Not allowed to assign admin" });
    }
    if (role === "owner") {
      return res.status(403).json({ message: "Owner assignment not allowed via invite. Transfer ownership instead." });
    }

    const user = await User.findOne({ email });

    // If user exists: add immediately
    if (user) {
      const already = team.members.some(m => m.userId.toString() === user._id.toString());
      if (already) return res.status(400).json({ message: "User already in team" });

      team.members.push({ userId: user._id, role: role || "member" });
      await team.save();

      // add team to user's teams list
      await User.findByIdAndUpdate(user._id, { $push: { teams: team._id } });

      return res.json({ message: "User added to team", team });
    }

    // If user does not exist: create invite record (email) and send email (TODO: implement email)
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await Invite.create({
      teamId,
      email,
      role: role || "member",
      token,
      expiresAt,
      invitedBy: inviterId
    });

    // TODO: send email with link: `${CLIENT_URL}/accept-invite?token=${token}`
    return res.json({ message: "Invite sent (user not registered)" });
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
    console.error(err);
    res.status(500).json({ message: "Error getting teams" });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate("members.userId", "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching team" });
  }
};

// change role of a member (owner/admin only)
exports.updateMemberRole = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: targetUserId, role } = req.body;
    const actorId = req.userId;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const actorRole = await getMemberRole(team, actorId);
    if (!["owner","admin"].includes(actorRole)) return res.status(403).json({ message: "Not allowed" });

    // only owner can assign owner
    if (role === "owner" && actorRole !== "owner") return res.status(403).json({ message: "Only owner can assign owner" });

    const member = team.members.find(m => m.userId.toString() === targetUserId);
    if (!member) return res.status(404).json({ message: "User not in team" });

    member.role = role;
    await team.save();
    res.json({ message: "Role updated", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating role" });
  }
};

// remove member
exports.removeMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: targetUserId } = req.body;
    const actorId = req.userId;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const actorRole = await getMemberRole(team, actorId);
    if (!["owner","admin"].includes(actorRole)) return res.status(403).json({ message: "Not allowed" });

    // owner cannot be removed except by transferring ownership
    const targetMember = team.members.find(m => m.userId.toString() === targetUserId);
    if (!targetMember) return res.status(404).json({ message: "User not in team" });
    if (targetMember.role === "owner") return res.status(403).json({ message: "Cannot remove owner" });

    team.members = team.members.filter(m => m.userId.toString() !== targetUserId);
    await team.save();

    // remove team from user's list
    await User.findByIdAndUpdate(targetUserId, { $pull: { teams: team._id } });

    res.json({ message: "Member removed", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing member" });
  }
};
