"use strict";
const express = require("express");
const ExpressError = require("./expressError");
const db = require("./db");
const app = express();

app.use(express.json());

//
app.get("/", async (req, res) => {
  console.log("PEN Home Page");
  return res.send({ message: "PEN Home Page", version: "v0.1.1" });
});
//
app.get("/users", async (req, res, next) => {
  console.log("/users route");
  try {
    const results = await db.query(`SELECT * FROM users`);
    return res.json({ users: results.rows });
  } catch (e) {
    console.log("error = ", e);
    return next(e);
  }
});

//

//
// standard error handlers and server startup
//

// 404 error for page not found if no other route is matched
app.use((req, res, next) => {
  const e = new ExpressError("Page Not Found", 404);
  return next(e);
});

// error handler
app.use((error, req, res, next) => {
  let status = error.status || 500; // default to 500
  let message = error.message;
  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
