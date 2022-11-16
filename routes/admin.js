const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const { ensureIsAdminAndNotThisUser } = require("../middleware/auth");
//

// admin can change a user to be an admin or not
// admin cannot change own admin status
// future release will include admin reset of password
router.patch(
  "/:username",
  ensureIsAdminAndNotThisUser,
  async (req, res, next) => {
    try {
      let { username } = req.params;
      username = username.toLowerCase();
      let { is_admin } = req.body;
      const user = await User.getAUser(username);
      if (is_admin === undefined) is_admin = user.is_admin;
      user.is_admin = is_admin;
      await user.save();
      return res.json(user);
    } catch (e) {
      return next(e);
    }
  }
);
//
module.exports = router;
