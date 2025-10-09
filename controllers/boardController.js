const Board = require("../models/BoardModal");
const Activity = require("../models/ActivityModal");
const mongoose = require("mongoose");

exports.createBoard = async (req, res) => {
  try {
    const { title, description, color, bgColor } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Board title is required" });
    }

    const newBoard = new Board({
      title,
      description,
      owner: req.userId,
      color,
      bgColor,
    });

    await newBoard.save();

    return res.status(201).json(newBoard);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ message: "Server error while creating board" });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const userId = req.userId;

    const boards = await Board.find({
      $or: [
        { owner: userId },
        { "team.user": userId }
      ],
    })
      .populate("owner", "name email")
      .populate("team.user", "name email");

    return res.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ message: "Server error while fetching boards" });
  }
};


exports.deleteBoard = async (req, res) => {
  try {
    const { id: boardId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid board ID" });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const isOwner = board.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ message: "Only the owner can delete this board" });
    }

    await Board.deleteOne({ _id: boardId });
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ message: "Error deleting board" });
  }
};



exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, color, bgColor } = req.body;

    const updatedBoard = await Board.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { owner: req.userId },
          { "team.user": req.userId }
        ]
      },
      { title, description, color, bgColor },
      { new: true }
    );

    if (!updatedBoard) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    return res.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    res.status(500).json({ message: "Server error while updating board" });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const board = await Board.findOne({
      _id: id,
      $or: [
        { owner: userId },
        { "team.user": userId }
      ]
    })
      .populate("owner", "name email")
      .populate("team.user", "name email");

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    return res.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ message: "Server error while fetching board" });
  }
};