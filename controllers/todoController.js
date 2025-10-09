const Todo = require("../models/todoModels");
const mongoose = require("mongoose");
const Board = require("../models/BoardModal");

exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ order: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTodo = async (req, res) => {
  try {
    let { title, description, priority, column, board, day, color, bgColor } = req.body;

    if (!title || !column || !board) {
      return res
        .status(400)
        .json({ message: "Title, column, and board are required" });
    }

    const boardDoc = await Board.findOne({
      _id: board,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!boardDoc) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority)) {
      priority = undefined;
    }

    const lastTodo = await Todo.findOne({ board }).sort("-order");
    const newOrder = lastTodo ? lastTodo.order + 1 : 1;

    const todoDate = day ? new Date(day) : new Date();

    const todo = await Todo.create({
      title,
      description,
      user: req.userId,
      board,
      column: new mongoose.Types.ObjectId(column),
      priority,
      order: newOrder,
      day: todoDate,
      color,
      bgColor,
    });

    res.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const board = await Board.findOne({
      _id: todo.board,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    let { title, completed, description, priority, column, color, day } = req.body;

    if (
      !title &&
      completed === undefined &&
      !description &&
      !priority &&
      !column &&
      !color &&
      day === undefined
    ) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    if (description !== undefined) todo.description = description;

    const allowed = ["low", "medium", "high"];
    if (priority !== undefined) {
      todo.priority = allowed.includes(priority) ? priority : todo.priority;
    }

    if (column !== undefined) todo.column = column;
    if (day !== undefined) todo.day = day;
    if (color !== undefined) todo.color = color;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const board = await Board.findOne({
      _id: todo.board,
      $or: [
        { owner: req.userId },
        { "team.user": req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found or not allowed" });
    }

    await Todo.deleteOne({ _id: todo._id });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTodoOrder = async (req, res) => {
  try {
    const { orderData } = req.body;
    if (!orderData || !Array.isArray(orderData))
      return res.status(400).json({ message: "Invalid order data" });

    const updates = orderData.map((t) =>
      Todo.findByIdAndUpdate(t.id, { order: t.order, column: t.column })
    );

    await Promise.all(updates);

    res.json({ message: "Order updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTodosByBoard = async (req, res) => {
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

    const todos = await Todo.find({ board: boardId })
      .sort({ order: 1 })
      .populate("column", "_id name")
      .populate("user", "name email");

    return res.json(todos);
  } catch (error) {
    console.error("Error fetching todos by board:", error);
    res.status(500).json({ message: "Error fetching todos by board" });
  }
};
