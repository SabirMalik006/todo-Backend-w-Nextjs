const express = require("express");
const router = express.Router();
const {
    createBoard,
    getBoard,
    addMember,
    removeMember,
    getBoardsByTeam,
    getAllBoards
} = require("../controllers/boardController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.get("/:boardId", getBoard);
router.get("/", getAllBoards);  
router.get("/team/:teamId", getBoardsByTeam);
router.post("/", createBoard);
router.patch("/:boardId/add-member", addMember);
router.patch("/:boardId/remove-member", removeMember);

module.exports = router;
