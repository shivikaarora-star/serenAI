
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.js";
import "./db.js"; // Initialize SQLite DB

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes); // /api/chat

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
