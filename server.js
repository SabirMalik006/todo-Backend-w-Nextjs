import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/authRoutes.js"
import todo from "./routes/todoRoutes.js"

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


app.use("/api/auth", auth);
app.use("/api/todo", todo);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
