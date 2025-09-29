const Column = require("../models/columnModel");


exports.getColumns = async (req, res) => {
  try {
    let columns = await Column.find({ user: req.userId }).sort({ order: 1 });

  
    if (columns.length === 0) {
      const defaults = [
        { name: "todo", user: req.userId, order: 1, isDefault: true },
        { name: "pending", user: req.userId, order: 2, isDefault: true },
        { name: "done", user: req.userId, order: 3, isDefault: true },
      ];

      columns = await Column.insertMany(defaults);
    }

    res.json(columns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createColumn = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Column name required" });

    const lastColumn = await Column.findOne({ user: req.userId }).sort("-order");
    const newOrder = lastColumn ? lastColumn.order + 1 : 1;

    const column = await Column.create({
      name,
      user: req.userId,
      order: newOrder,
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
    const columns = await Column.find({ board: boardId });
    res.json(columns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching columns" });
  }
};