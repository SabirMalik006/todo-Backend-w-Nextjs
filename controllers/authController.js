
const User = require("../models/userModels.js");
const Token = require("../models/tokenModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Column = require("../models/columnModel.js");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    // Create default columns
    const defaultColumnsNames = ["todo", "pending", "done"];
    const createdColumns = await Promise.all(
      defaultColumnsNames.map((name, idx) =>
        Column.create({
          name,
          user: user._id,
          order: idx + 1,
          isDefault: true,
        })
      )
    );

    // Create dummy todo in first column ("todo")
    const firstColumn = createdColumns[0]; // "todo" column
    await Todo.create({
      title: "Welcome! 🎉",
      description: "This is your first todo. Edit or delete it to get started.",
      user: user._id,
      columnId: firstColumn._id,
    });

    // Return only user info (no changes here)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      await Token.findOneAndUpdate(
          { userId: user._id },
          { refreshToken, accessToken },
          { upsert: true, new: true }
      );

      res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          accessToken,
          refreshToken,
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token required" });

    const tokenDoc = await Token.findOne({ refreshToken });
    if (!tokenDoc)
      return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token" });

      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const userId = req.userId;
    await Token.deleteOne({ userId });

    res.json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email image");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
