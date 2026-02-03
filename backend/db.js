import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database
const dbPromise = open({
    filename: './chat.db',
    driver: sqlite3.Database
});

async function initDB() {
    const db = await dbPromise;

    await db.exec(`
    CREATE TABLE IF NOT EXISTS threads (
      threadId TEXT PRIMARY KEY,
      title TEXT,
      updatedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      threadId TEXT,
      role TEXT,
      content TEXT,
      timestamp INTEGER,
      FOREIGN KEY(threadId) REFERENCES threads(threadId) ON DELETE CASCADE
    );
  `);

    console.log("SQLite Database Initialized");
}

initDB();

export default dbPromise;
