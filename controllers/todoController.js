// controllers/todoController.js
import Todo from "../models/todoModels.js";

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ order: 1 });

    res.json({
      todo: todos.filter(t => t.status === "todo"),
      pending: todos.filter(t => t.status === "pending"),
      done: todos.filter(t => t.status === "done"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTodo = async (req, res) => {
  try {
    let { title, description, priority, status } = req.body;

    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
      priority = "low";
    }

    const allowedStatus = ["todo", "pending", "done"];
    if (!allowedStatus.includes(status)) {
      status = "todo";
    }

    const lastTodo = await Todo.findOne({ user: req.user }).sort("-order");
    const newOrder = lastTodo ? lastTodo.order + 1 : 1;

    const todo = await Todo.create({
      title,
      description,
      user: req.user,
      priority,
      status,
      order: newOrder,
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    let { title, description, priority, status, order } = req.body;

    if (
      title === undefined &&
      description === undefined &&
      priority === undefined &&
      status === undefined &&
      order === undefined
    ) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;

    const allowedPriorities = ["low", "medium", "high"];
    if (priority !== undefined) {
      todo.priority = allowedPriorities.includes(priority)
        ? priority
        : todo.priority;
    }

    const allowedStatus = ["todo", "pending", "done"];
    if (status !== undefined) {
      todo.status = allowedStatus.includes(status) ? status : todo.status;
    }

    if (order !== undefined) todo.order = order;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    await Todo.deleteOne({ _id: todo._id });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTodoOrder = async (req, res) => {
  try {
    const { orderData } = req.body;
    if (!orderData || !Array.isArray(orderData)) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const updates = orderData.map(t =>
      Todo.findByIdAndUpdate(t.id, { order: t.order, status: t.status })
    );
    await Promise.all(updates);

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
