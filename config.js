"use strict";

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3000;
// console.log("process.env.PORT = ", process.env.PORT, PORT);

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "pen01db"
    : process.env.DATABASE_URL || "pen01db";
}

// console.log("PEN Config:".green);
// console.log("SECRET_KEY:".yellow, SECRET_KEY);
// console.log("PORT:".yellow, PORT.toString());
// console.log("Database:".yellow, getDatabaseUri());
// console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  getDatabaseUri,
};
