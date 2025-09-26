const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const columnController = require("../controllers/columnController");


router.use(authMiddleware);

router.get("/board/:id", columnController.getColumnsByBoard);

router.get("/", columnController.getColumns);


router.post("/", columnController.createColumn);


router.put("/:id", columnController.updateColumn);


router.delete("/:id", columnController.deleteColumn);

module.exports = router;
