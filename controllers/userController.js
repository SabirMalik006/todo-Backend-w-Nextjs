const User = require("../models/userModels");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};




exports.updateUser = async (req, res) => {
  try {
    const { name, oldPassword, newPassword, image } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "Invalid token or user not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required to set a new password" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (image) user.image = image; 

    await user.save();

    res.json({ message: "Profile updated successfully", user }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.changeName = async (req, res) => {
  try {
    const { name, oldPassword } = req.body;

   
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

  
    user.name = name;
    await user.save();

    res.json({ message: "Name updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
