const Board = require("../models/BoardModal");
const Team = require("../models/TeamModal");

async function getMemberRole(team, userId) {
  const member = team.members.find(m => m.userId.toString() === userId.toString());
  return member ? member.role : null;
}

exports.getAllBoards = async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching boards" });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { title, description, teamId } = req.body; 
    const userId = req.userId;

    if (!title || !teamId) {
      return res.status(400).json({ message: "Title and teamId are required" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const role = await getMemberRole(team, userId);
    if (!["owner", "admin"].includes(role)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const board = await Board.create({
      title,
      description: description || "",
      team: teamId,
      members: [{ userId, role: "admin" }],
      columns: [], 
    });

    team.boards.push(board._id);
    await team.save();

    res.status(201).json(board);
  } catch (err) {
    console.error("Create Board Error:", err);
    res.status(500).json({ message: "Error creating board" });
  }
};


exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).populate("members.userId", "name email");
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: "Error fetching board" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId, role } = req.body;
    const actorId = req.userId;

    const board = await Board.findById(boardId).populate("team");
    if (!board) return res.status(404).json({ message: "Board not found" });

    const teamRole = await getMemberRole(board.team, actorId);
    if (!["owner","admin"].includes(teamRole)) return res.status(403).json({ message: "Not allowed" });

    const already = board.members.some(m => m.userId.toString() === userId);
    if (already) return res.status(400).json({ message: "User already in board" });

    board.members.push({ userId, role: role || "member" });
    await board.save();

    res.json({ message: "Member added", board });
  } catch (err) {
    res.status(500).json({ message: "Error adding member" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId: targetUserId } = req.body;
    const actorId = req.userId;

    const board = await Board.findById(boardId).populate("team");
    if (!board) return res.status(404).json({ message: "Board not found" });

    const teamRole = await getMemberRole(board.team, actorId);
    if (!["owner","admin"].includes(teamRole)) return res.status(403).json({ message: "Not allowed" });

    board.members = board.members.filter(m => m.userId.toString() !== targetUserId);
    await board.save();

    res.json({ message: "Member removed", board });
  } catch (err) {
    res.status(500).json({ message: "Error removing member" });
  }
};

exports.getBoardsByTeam = async (req, res) => {
  try {
    const boards = await Board.find({ teamId: req.params.teamId });
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching boards" });
  }
};
// exports.deleteBoard = async (req, res) => {
//   try {
//     const { boardId } = req.params;
//     const actorId = req.userId;
//     const board = await Board.findById(boardId).populate("team");
//     if (!board) return res.status(404).json({ message: "Board not found" });
//     const teamRole = await getMemberRole(board.team, actorId);
//     if (!["owner","admin"].includes(teamRole)) return res.status(403).json({ message: "Not allowed" });
//     await Board.findByIdAndDelete(boardId);
//     board.team.boards = board.team.boards.filter(bId => bId.toString() !== boardId);
//     await board.team.save();
//     res.json({ message: "Board deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting board" });
//   }
// }