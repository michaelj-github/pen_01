const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
//

//

function authenticateJWT(req, res, next) {
  // console.log("Validate Token from body", req.body.token, SECRET_KEY);
  // console.log(
  //   "Validate Token from header",
  //   req.headers.authorization,
  //   SECRET_KEY
  // );
  try {
    // req.user = jwt.verify(req.body.token, SECRET_KEY);
    req.user = jwt.verify(req.headers.authorization, SECRET_KEY);
    // console.log("Valid Token, req.user = ", req.user);
    return next();
  } catch (e) {
    // console.log("e = ", e);
    return next();
  }
}

function ensureIsLoggedIn(req, res, next) {
  if (!req.user) {
    const e = new ExpressError("Please log in first", 401);
    return next(e);
  }
  return next();
}

function ensureIsAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    const e = new ExpressError("Must be logged in as an admin", 401);
    return next(e);
  }
  return next();
}

function ensureIsThisUserOrIsAdmin(req, res, next) {
  if (
    !req.user ||
    !(req.user.is_admin || req.user.username === req.params.username)
  ) {
    const e = new ExpressError("Must be this user or an admin", 401);
    return next(e);
  }
  return next();
}

function ensureIsAdminAndNotThisUser(req, res, next) {
  let message = "Must be an admin";
  if (req.user.is_admin) message += " and cannot be this admin";
  if (
    !req.user ||
    !req.user.is_admin ||
    req.user.username === req.params.username
  ) {
    const e = new ExpressError(message, 401);
    return next(e);
  }
  return next();
}

//

//

module.exports = {
  authenticateJWT,
  ensureIsLoggedIn,
  ensureIsAdmin,
  ensureIsThisUserOrIsAdmin,
  ensureIsAdminAndNotThisUser,
};
