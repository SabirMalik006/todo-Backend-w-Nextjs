
const Column = require("../models/columnModel");
const Todo = require("../models/todoModels");


exports.getBoardActivities = async (req, res) => {
  try {
    const { id } = req.params; 


    const columns = await Column.find({ boardId: id });


    const todos = await Todo.find({ boardId: id });

    return res.json({
      boardId: id,
      columns,
      todos,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error while fetching activities" });
  }
};
