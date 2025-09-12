const express = require("express");
const { updateUser , changeName} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.put("/update-user", authMiddleware, updateUser);
router.put("/change-name", authMiddleware, changeName);


module.exports = router;
