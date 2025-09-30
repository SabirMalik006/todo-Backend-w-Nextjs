const Column = require("../models/columnModel");


exports.getColumns = async (req, res) => {
  try {
    const { boardId } = req.query; 

    if (!boardId) {
      return res.status(400).json({ message: "Board ID is required" });
    }

    let columns = await Column.find({ user: req.userId, board: boardId }).sort({ order: 1 });

    if (columns.length === 0) {
      const defaults = [
        { name: "Todo", user: req.userId, board: boardId, order: 1, isDefault: true },
        { name: "Pending", user: req.userId, board: boardId, order: 2, isDefault: true },
        { name: "Done", user: req.userId, board: boardId, order: 3, isDefault: true },
      ];

      columns = await Column.insertMany(defaults);
    }

    res.json(columns);
  } catch (err) {
    console.error("Error fetching columns:", err);
    res.status(500).json({ message: err.message });
  }
};



exports.createColumn = async (req, res) => {
  try {
    const boardId = req.body.boardId || req.body.board;
    const { name } = req.body;

    if (!name || !boardId)
      return res.status(400).json({ message: "Name and boardId are required" });

    const last = await Column.findOne({ board: boardId, user: req.userId }).sort("-order");
    const order = last ? last.order + 1 : 1;

    const column = await Column.create({
      name,
      user: req.userId,
      board: boardId,
      order,
      isDefault: false,
    });

    res.json(column);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Column name is required" });
    }

    const column = await Column.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name },
      { new: true }
    );

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    res.json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.deleteColumn = async (req, res) => {
  try {
    const col = await Column.findOne({ _id: req.params.id, user: req.userId });
    if (!col) return res.status(404).json({ message: "Column not found" });

    await Column.deleteOne({ _id: col._id });
    res.json({ message: "Column deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getColumnsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({ message: "Board ID is required" });
    }

    let columns = await Column.find({
      board: boardId,
      user: req.userId,
    }).sort({ order: 1 });

    if (columns.length === 0) {
      const defaults = [
        { name: "Todo", user: req.userId, board: boardId, order: 1, isDefault: true },
        { name: "Pending", user: req.userId, board: boardId, order: 2, isDefault: true },
        { name: "Done", user: req.userId, board: boardId, order: 3, isDefault: true },
      ];

      columns = await Column.insertMany(defaults);
    }

    return res.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ message: "Error fetching columns" });
  }
};
