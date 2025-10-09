const crypto = require("crypto");
const BoardTeam = require("../models/BoardTeam");
const BoardInvite = require("../models/BoardInvite");
const sendEmail = require("../config/sendEmail");
const User = require("../models/userModels");
const Board = require("../models/BoardModal");
const mongoose = require("mongoose");

const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { boardId } = req.params;
    const invitedById = req.userId;

    if (!invitedById) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const inviter = await User.findById(invitedById);
    if (!inviter) {
      return res.status(404).json({ message: "Inviter not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await BoardInvite.create({
      email,
      boardId,
      invitedBy: invitedById,
      token,
    });

    const inviteUrl = `${process.env.CLIENT_URL}/invite/respond?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Board Invitation - Action Required",
      html: `
        <h2>You've been invited to join a team board!</h2>
        <p>${inviter.name || "A user"} invited you to collaborate on their board.</p>
        <p>Click below to respond:</p>
        <a href="${inviteUrl}" 
           style="display:inline-block;padding:10px 15px;background:#2B1887;color:white;text-decoration:none;border-radius:8px;">
           Respond to Invitation
        </a>
        <p>If you don't want to join, you can ignore this email.</p>
      `,
    });

    res.json({ message: "Invitation email sent successfully." });
  } catch (err) {
    console.error("❌ inviteMember error:", err);
    res.status(500).json({ message: "Failed to send invite" });
  }
};

const respondInvite = async (req, res) => {
  try {
    const { token } = req.query;
    const { action } = req.body;

    const invite = await BoardInvite.findOne({ token });

    if (!invite) {
      return res.status(400).json({ message: "Invalid or expired invitation" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invitation already responded" });
    }

    if (action === "reject") {
      invite.status = "rejected";
      await invite.save();
      return res.json({ message: "Invitation rejected" });
    }

    if (action === "accept") {
      const user = await User.findOne({ email: invite.email });
      if (!user) {
        return res.status(400).json({
          message: "You must sign up first with this email before accepting invite",
        });
      }

      let team = await BoardTeam.findOne({ board: invite.boardId });
      if (!team) {
        team = await BoardTeam.create({
          board: invite.boardId,
          owner: invite.invitedBy,
          members: [user._id],
        });
      } else {
        if (!team.members.includes(user._id)) {
          team.members.push(user._id);
          await team.save();
        }
      }

      const board = await Board.findById(invite.boardId);
      if (board) {
        const isAlreadyInTeam = board.team.some(
          (m) => m.user && m.user.toString() === user._id.toString()
        );

        if (!isAlreadyInTeam) {
          board.team.push({
            user: user._id,
            role: "member",
          });
          await board.save();
        }
      }

      invite.status = "accepted";
      await invite.save();

      return res.json({ message: "Invitation accepted successfully 🎉" });
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("❌ respondInvite error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getBoardMembers = async (req, res) => {
  try {
    const { boardId } = req.params;

    const team = await BoardTeam.findOne({ board: boardId })
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!team) return res.status(404).json({ message: "No team found for this board" });

    res.json({
      boardId,
      ownerId: team.owner._id,
      members: [
        { _id: team.owner._id, name: team.owner.name, email: team.owner.email },
        ...team.members.map((m) => ({
          _id: m._id,
          name: m.name,
          email: m.email,
        })),
      ],
    });
  } catch (err) {
    console.error("getBoardMembers error:", err);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { boardId, memberId } = req.params;

    const team = await BoardTeam.findOneAndUpdate(
      { board: boardId },
      { $pull: { members: memberId } },
      { new: true }
    );

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const invite = await BoardInvite.findOne({ token });

    if (!invite) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already used or rejected" });
    }

    const user = await User.findOne({ email: invite.email });
    if (!user) {
      return res.status(400).json({
        message: "You must sign up first with this email before accepting invite",
      });
    }

    let team = await BoardTeam.findOne({ board: invite.boardId });
    if (!team) {
      team = await BoardTeam.create({
        board: invite.boardId,
        owner: invite.invitedBy,
        members: [user._id],
      });
    } else {
      if (!team.members.includes(user._id)) {
        team.members.push(user._id);
        await team.save();
      } 
    }

    const board = await Board.findById(invite.boardId);
    if (board) {
      const isAlreadyInTeam = board.team.some(
        (m) => m.user && m.user.toString() === user._id.toString()
      );

      if (!isAlreadyInTeam) {
        board.team.push({
          user: user._id,
          role: "member",
        });
        await board.save();
      }
    }

    invite.status = "accepted";
    await invite.save();
    res.json({ message: "Invite accepted successfully" });
  } catch (error) {
    console.error("acceptInvite error:", error);
    res.status(500).json({ message: "Server error accepting invite" });
  }
};

const rejectInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const invite = await BoardInvite.findOne({ token });
    if (!invite) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already used or rejected" });
    }
    invite.status = "rejected";
    await invite.save();
    res.json({ message: "Invite rejected successfully" });
  } catch (error) {
    console.error("rejectInvite error:", error);
    res.status(500).json({ message: "Server error rejecting invite" });
  }
}

module.exports = {
  rejectInvite,
  acceptInvite,
  inviteMember,
  respondInvite,
  getBoardMembers,
  removeMember,
};