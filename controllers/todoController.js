const Todo = require("../models/todoModels");

exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user }).sort({ order: 1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.createTodo = async (req, res) => {
  try {
    let { title, description, priority } = req.body;
    console.log("Create body received:", req.body);

    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority)) {
      priority = undefined;
    }

    const lastTodo = await Todo.findOne({ user: req.user }).sort("-order");
    const newOrder = lastTodo ? lastTodo.order + 1 : 1;

    const todo = await Todo.create({
      title,
      description,
      user: req.user,
      priority,
      order: newOrder,
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    let { title, completed, description, priority } = req.body;

    if (!title && completed === undefined && !description && !priority) {
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

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    await Todo.deleteOne({ _id: todo._id });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTodoOrder = async (req, res) => {
  try {
    const { orderData } = req.body;  // yahan orderData read karo
    if (!orderData || !Array.isArray(orderData))
      return res.status(400).json({ message: "Invalid order data" });

    const updates = orderData.map(t =>
      Todo.findByIdAndUpdate(t.id, { order: t.order })
    );
    await Promise.all(updates);

    res.json({ message: "Order updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




