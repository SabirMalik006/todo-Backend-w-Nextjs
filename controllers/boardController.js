const Board = require("../models/BoardModal");
const Activity = require("../models/ActivityModal");



exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Board title is required" });
    }

    const newBoard = new Board({
      title,
      description,
      owner: req.userId, 
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
    const boards = await Board.find({ owner: req.userId }); 
    return res.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ message: "Server error while fetching boards" });
  }
};


exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findOneAndDelete({ _id: id, owner: req.userId }); 

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    return res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ message: "Server error while deleting board" });
  }
};


exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedBoard = await Board.findOneAndUpdate(
      { _id: id, owner: req.userId }, 
      { title, description },
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
    const board = await Board.findOne({ _id: id, owner: req.userId });
    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }
    return res.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ message: "Server error while fetching board" });
  } 
};
