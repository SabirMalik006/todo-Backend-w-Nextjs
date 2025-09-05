const Todo = require("../models/todoModels");

exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createTodo = async (req, res) => {
  try {
    const { title , description } = req.body;
    const todo = await Todo.create({ title , description, user: req.user });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const { title, completed ,description} = req.body;
    if(!title && !completed && !description) return res.status(400).json({ message: "At least one field is required" });

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    if (description !== undefined) todo.description = description;

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
  
