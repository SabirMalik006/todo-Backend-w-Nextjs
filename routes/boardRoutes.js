const express = require("express");
const router = express.Router();
const {
  createBoard,
  getBoards,
  deleteBoard,
  updateBoard,
} = require("../controllers/boardController");
const authMiddleware = require("../middleware/authMiddleware");





router.post("/", authMiddleware, createBoard);


router.get("/", authMiddleware, getBoards);


router.put("/:id", authMiddleware, updateBoard);

router.delete("/:id", authMiddleware, deleteBoard);

module.exports = router;
