const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/todo", require("./routes/todoRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/image", require("./routes/imageRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
