const { Client } = require("pg");

// const DB_URI = "postgresql:///pend02";
const DB_URI = process.env.DATABASE_URL || "pen01db";

const db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
