const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getTodos, createTodo, updateTodoOrder, updateTodo, deleteTodo , getTodosByBoard } = require("../controllers/todoController");
router.get("/", authMiddleware, getTodos);
router.post("/", authMiddleware, createTodo);
router.put("/update-order", authMiddleware ,  updateTodoOrder);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);
router.get("/board/:boardId", authMiddleware, getTodosByBoard);




module.exports = router;
