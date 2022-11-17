"use strict";
const express = require("express");
const ExpressError = require("./expressError");
const db = require("./db"); // won't need this once routes and models are implemented
const app = express();
const { authenticateJWT } = require("./middleware/auth");

app.use(express.json());
app.use(authenticateJWT);
//

// routes
const usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);
const companiesRoutes = require("./routes/companies");
app.use("/companies", companiesRoutes);
const analysesRoutes = require("./routes/analyses");
app.use("/analyses", analysesRoutes);
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);
//

//
app.get("/", async (req, res) => {
  console.log("PEN Home Page v0.1.1");
  return res.json({ message: "PEN Home Page", version: "v0.1.1" });
});

// this will be in routes/models
// app.get("/users", async (req, res, next) => {
//   console.log("/users route");
//   try {
//     const results = await db.query(`SELECT * FROM users`);
//     return res.json({ users: results.rows });
//   } catch (e) {
//     console.log("error = ", e);
//     return next(e);
//   }
// });

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
