const express = require("express");
const { updateUser , changeName , getAllUsers} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.put("/update-user", authMiddleware, updateUser);
router.put("/change-name", authMiddleware, changeName);
router.get("/all-users",getAllUsers);


module.exports = router;
