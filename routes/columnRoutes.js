const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const columnController = require("../controllers/columnController");

router.use(authMiddleware);

router.get("/board/:boardId", authMiddleware, columnController.getColumnsByBoard);

router.get("/", columnController.getColumns);

router.post("/", columnController.createColumn);

router.put("/update-order", authMiddleware, columnController.updateColumnOrder);

router.put("/:id", columnController.updateColumn);

router.delete("/:id", columnController.deleteColumn);

module.exports = router;
