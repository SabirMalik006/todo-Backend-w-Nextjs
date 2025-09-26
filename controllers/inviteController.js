const Invite = require("../models/InviteModal");
const Team = require("../models/TeamModal");
const Board = require("../models/BoardModal");
const User = require("../models/userModels");


exports.sendInvite = async (req, res) => {
  try {
    const { email, teamId, boardId, role } = req.body;
    const invitedBy = req.userId;

    if (!email) return res.status(400).json({ message: "Email required" });


    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });


    const existingInvite = await Invite.findOne({ email, team: teamId, board: boardId, status: "pending" });
    if (existingInvite) return res.status(400).json({ message: "Invite already sent" });

    const invite = await Invite.create({
      email,
      invitedBy,
      team: teamId || null,
      board: boardId || null,
      role: role || "member",
    });

    res.status(201).json(invite);
  } catch (err) {
    res.status(500).json({ message: "Error sending invite" });
  }
};


exports.getMyInvites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const invites = await Invite.find({ email: user.email, status: "pending" })
      .populate("invitedBy", "name email")
      .populate("team", "name")
      .populate("board", "title");
    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invites" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.userId;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.status !== "pending") return res.status(400).json({ message: "Invite already handled" });


    if (invite.team) {
      const team = await Team.findById(invite.team);
      if (!team) return res.status(404).json({ message: "Team not found" });

      const already = team.members.some(m => m.userId.toString() === userId.toString());
      if (!already) {
        team.members.push({ userId, role: invite.role });
        await team.save();
      }
    }

 
    if (invite.board) {
      const board = await Board.findById(invite.board);
      if (!board) return res.status(404).json({ message: "Board not found" });

      const already = board.members.some(m => m.userId.toString() === userId.toString());
      if (!already) {
        board.members.push({ userId, role: invite.role });
        await board.save();
      }
    }

    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted", invite });
  } catch (err) {
    res.status(500).json({ message: "Error accepting invite" });
  }
};


exports.rejectInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invite rejected" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting invite" });
  }
};


exports.cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const actorId = req.userId;

    const invite = await Invite.findById(inviteId).populate("team").populate("board");
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.invitedBy.toString() !== actorId.toString()) {
      return res.status(403).json({ message: "Not allowed to cancel this invite" });
    }

    await Invite.findByIdAndDelete(inviteId);

    res.json({ message: "Invite cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling invite" });
  }
};
