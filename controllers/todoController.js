const Todo = require("../models/todoModels");
const mongoose = require("mongoose");
const column = require("../models/columnModel");

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
    let { title, description, priority, column, board, day } = req.body;

    if (!title || !column || !board) {
      return res
        .status(400)
        .json({ message: "Title, column, and board are required" });
    }

    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority)) {
      priority = undefined;
    }


    const lastTodo = await Todo.findOne({ user: req.userId, board }).sort("-order");
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
    });

    res.json(todo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    let { title, completed, description, priority, column } = req.body;

    if (
      !title &&
      completed === undefined &&
      !description &&
      !priority &&
      !column
    ) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    if (description !== undefined) todo.description = description;

    const allowed = ["low", "medium", "high"];
    if (priority !== undefined) {
      todo.priority = allowed.includes(priority) ? priority : todo.priority;
    }

    if (column !== undefined) {
      todo.column = column;
    }
    if (req.body.day !== undefined) todo.day = req.body.day;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

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
    if (!boardId)
      return res.status(400).json({ message: "Board ID is required" });

    const todos = await Todo.find({
      user: req.userId,
      board: boardId,
    })
      .sort({ order: 1 })
      .populate("column", "_id name");

    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos by board:", error);
    res.status(500).json({ message: "Error fetching todos by board" });
  }
};
