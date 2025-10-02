const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");

router.post("/:todoId/comments", auth, addComment);
router.get("/:todoId/comments", auth, getComments);
router.put("/:todoId/comments/:commentId", auth, updateComment);
router.delete("/:todoId/comments/:commentId", auth, deleteComment);

module.exports = router;
