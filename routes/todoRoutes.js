const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    updateTodoOrder
} = require("../controllers/todoController");

router.get("/", authMiddleware, getTodos);
router.post("/", authMiddleware, createTodo);
router.put("/update-order", authMiddleware ,  updateTodoOrder);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);




module.exports = router;
