const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const User = require("../models/user");
const {
  ensureIsAdmin,
  ensureIsThisUserOrIsAdmin,
  ensureIsAdminAndNotThisUser,
} = require("../middleware/auth");
//

// must be admin to get all users
// router.get("/", ensureIsAdmin, async (req, res, next) => {
// temporary: allow anyone to get a list of users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    // return res.json({ users });
    return res.json(users);
  } catch (e) {
    return next(e);
  }
});

// login with username and password in req.body
router.get("/login", async (req, res, next) => {
  try {
    let { username, password } = req.body;
    username = username.toLowerCase();
    const user = await User.authenticateAUser(username, password);
    const payload = {
      username: username,
      is_admin: user.is_admin,
    };

    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ message: "Logged in", user, token });
    // return res.json({ user });
    // return res.json(user);
  } catch (e) {
    return next(e);
  }
});

// must be admin or this user
router.get("/:username", ensureIsThisUserOrIsAdmin, async (req, res, next) => {
  try {
    let { username } = req.params;
    username = username.toLowerCase();
    const user = await User.getAUser(username);

    return res.json(user);
  } catch (e) {
    return next(e);
  }
});

// anyone can create own user account
// for a new user is_admin = false
router.post("/", async (req, res, next) => {
  try {
    let { username, password, first_name, last_name, email } = req.body;
    username = username.toLowerCase();
    const user = await User.addAUser(
      username,
      password,
      first_name,
      last_name,
      email
    );

    const payload = {
      username: username,
      is_admin: false,
    };

    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ message: "Registered", user, token });

    // return res.json(user);
  } catch (e) {
    return next(e);
  }
});

// must be an admin and admin cannot delete own account
router.delete(
  "/:username",
  ensureIsAdminAndNotThisUser,
  async (req, res, next) => {
    try {
      let { username } = req.params;
      username = username.toLowerCase();
      const user = await User.getAUser(username);
      await user.delete();
      // return res.json({ user });
      return res.json({ message: "deleted" });
    } catch (e) {
      return next(e);
    }
  }
);

// must be admin or this user, cannot use this route to change is_admin
router.patch(
  "/:username",
  ensureIsThisUserOrIsAdmin,
  async (req, res, next) => {
    try {
      let { username } = req.params;
      username = username.toLowerCase();
      let { first_name, last_name, email } = req.body;
      const user = await User.getAUser(username);
      if (!first_name) first_name = user.first_name;
      if (!last_name) last_name = user.last_name;
      if (!email) email = user.email;
      user.first_name = first_name;
      user.last_name = last_name;
      user.email = email;
      await user.save();
      return res.json(user);
    } catch (e) {
      return next(e);
    }
  }
);
//
module.exports = router;
