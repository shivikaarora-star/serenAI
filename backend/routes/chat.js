import express from "express";
import dbPromise from "../db.js";
import model from "../utils/openai.js"; // Gemini AI model

const router = express.Router();

// Test Route
router.post("/test", async (req, res) => {
    res.json({ status: "SQLite Active" });
});

// Get all threads
router.get("/thread", async (req, res) => {
    try {
        const db = await dbPromise;
        const threads = await db.all("SELECT * FROM threads ORDER BY updatedAt DESC");
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages of one thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const db = await dbPromise;
        const thread = await db.get("SELECT * FROM threads WHERE threadId = ?", [threadId]);

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        const messages = await db.all(
            "SELECT * FROM messages WHERE threadId = ? ORDER BY timestamp ASC",
            [threadId]
        );
        res.json(messages);
    } catch (err) {
        console.log("Get Thread Error:", err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const db = await dbPromise;
        const result = await db.run("DELETE FROM threads WHERE threadId = ?", [threadId]);
        await db.run("DELETE FROM messages WHERE threadId = ?", [threadId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// CHAT ROUTE — Gemini API
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = await dbPromise;

        // Check if thread exists, else create new
        let thread = await db.get("SELECT * FROM threads WHERE threadId = ?", [threadId]);

        if (!thread) {
            await db.run(
                "INSERT INTO threads (threadId, title, updatedAt) VALUES (?, ?, ?)",
                [threadId, message.substring(0, 50), Date.now()]
            );
        } else {
            await db.run("UPDATE threads SET updatedAt = ? WHERE threadId = ?", [Date.now(), threadId]);
        }

        // Save user message
        await db.run(
            "INSERT INTO messages (threadId, role, content, timestamp) VALUES (?, ?, ?, ?)",
            [threadId, "user", message, Date.now()]
        );

        // Fetch chat history
        const history = await db.all(
            "SELECT role, content FROM messages WHERE threadId = ? ORDER BY timestamp ASC",
            [threadId]
        );

        // Convert history for Gemini
        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }))
        });

        // Send message to Gemini
        const result = await chat.sendMessage(message);
        const assistantReply = result.response.text();

        // Save assistant reply
        await db.run(
            "INSERT INTO messages (threadId, role, content, timestamp) VALUES (?, ?, ?, ?)",
            [threadId, "assistant", assistantReply, Date.now()]
        );

        res.json({ reply: assistantReply });

    } catch (err) {
        console.log("Chat Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;