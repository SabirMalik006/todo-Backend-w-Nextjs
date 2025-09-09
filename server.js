const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://todo-frontend-nextjs-47j4p7jfg-sabir-maliks-projects.vercel.app/"
  ],
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/todo", require("./routes/todoRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
