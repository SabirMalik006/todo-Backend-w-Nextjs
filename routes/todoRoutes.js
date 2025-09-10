import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/authMiddleware.js";
import { getTodos, createTodo, updateTodoOrder, updateTodo, deleteTodo } from "../controllers/todoController.js";
router.get("/", authMiddleware, getTodos);
router.post("/", authMiddleware, createTodo);
router.put("/update-order", authMiddleware ,  updateTodoOrder);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);




export default router;
