const Column = require("../models/columnModel");
const Board = require("../models/BoardModal");
const Todo = require("../models/todoModels");


exports.getColumns = async (req, res) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      return res.status(400).json({ message: "Board ID is required" });
    }

    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    let columns = await Column.find({ board: boardId }).sort({ order: 1 });

    if (columns.length === 0) {
      const defaults = [
        { name: "Todo", user: board.owner, board: boardId, order: 1, isDefault: true },
        { name: "Pending", user: board.owner, board: boardId, order: 2, isDefault: true },
        { name: "Done", user: board.owner, board: boardId, order: 3, isDefault: true },
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

    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    const last = await Column.findOne({ board: boardId }).sort("-order");
    const order = last ? last.order + 1 : 1;

    const column = await Column.create({
      name,
      user: board.owner,
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

    const column = await Column.findById(req.params.id);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    const board = await Board.findOne({
      _id: column.board,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    column.name = name;
    await column.save();

    res.json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    if (!column) return res.status(404).json({ message: "Column not found" });

    const board = await Board.findOne({
      _id: column.board,
      owner: req.userId
    });

    if (!board) {
      return res.status(404).json({ message: "Only board owner can delete columns" });
    }

    await Column.deleteOne({ _id: column._id });
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

    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    let columns = await Column.find({ board: boardId }).sort({ order: 1 });

    if (columns.length === 0) {
      const defaults = [
        { name: "Todo", user: board.owner, board: boardId, order: 1, isDefault: true },
        { name: "Pending", user: board.owner, board: boardId, order: 2, isDefault: true },
        { name: "Done", user: board.owner, board: boardId, order: 3, isDefault: true },
      ];

      columns = await Column.insertMany(defaults);
    }

    return res.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ message: "Error fetching columns" });
  }
};


exports.updateColumnOrder = async (req, res) => {
  try {
    const orderData = req.body.orderData || req.body.columnOrderData;

    if (!Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty order data" });
    }

    const updates = [];

    for (const item of orderData) {
      if (!item.id || item.order === undefined) {
        return res.status(400).json({ message: "Invalid column item format" });
      }

      const updated = await Column.findByIdAndUpdate(
        item.id,
        { order: item.order, board: item.board },
        { runValidators: false, new: true }
      );

      if (updated) updates.push(updated._id);
    }

    res.status(200).json({
      message: "Column order updated successfully",
      updatedColumns: updates.length,
    });
  } catch (error) {
    console.error("Column update-order error:", error);
    res.status(500).json({
      message: "Server error while updating column order",
      error: error.message,
    });
  }
};



