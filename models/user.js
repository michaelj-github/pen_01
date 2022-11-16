const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  constructor(username, password, first_name, last_name, email, is_admin) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.is_admin = is_admin;
  }

  static async getAllUsers() {
    const results = await db.query(
      "SELECT username, password, first_name, last_name, email, is_admin FROM users"
    );
    const users = results.rows.map(
      (r) =>
        new User(
          r.username,
          r.password,
          r.first_name,
          r.last_name,
          r.email,
          r.is_admin
        )
    );
    return users;
  }

  static async getAUser(username) {
    // console.log("username = ", username);

    username = username.toLowerCase();
    const results = await db.query(
      `SELECT first_name, password, last_name, email, is_admin FROM users WHERE username = $1`,
      [username]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not find a user with username = ${username}.`,
        404
      );
    }
    // return results.rows[0];
    const user = results.rows[0];
    return new User(
      username,
      user.password,
      user.first_name,
      user.last_name,
      user.email,
      user.is_admin
    );
  }

  static async authenticateAUser(username, password) {
    // console.log("username, password = ", username, password);

    username = username.toLowerCase();
    const results = await db.query(
      `SELECT first_name, password, last_name, email, is_admin FROM users WHERE username = $1`,
      [username]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not find a user with username = ${username}.`,
        404
      );
    }

    // return results.rows[0];
    const user = results.rows[0];

    if (await bcrypt.compare(password, user.password)) {
      return new User(
        username,
        user.password,
        user.first_name,
        user.last_name,
        user.email,
        user.is_admin
      );
    }

    throw new ExpressError(
      `Could not log in with that username and password.`,
      404
    );
  }

  //
  // add a new user to the database
  // with username and hashed password
  //

  static async addAUser(
    username,
    new_password,
    new_first_name,
    new_last_name,
    new_email
  ) {
    if (!username || !new_password) {
      throw new ExpressError(`Username and password are required.`, 400);
    }
    username = username.toLowerCase();
    const checkResults = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );
    if (checkResults.rows.length !== 0) {
      throw new ExpressError(
        `Can not add a duplicate user with username = ${username}.`,
        400
      );
    }

    if (!new_first_name || !new_last_name || !new_email) {
      throw new ExpressError(
        `First name, last name, and email are required.`,
        400
      );
    }

    // new users should never be created with admin status
    // a current admin can update any existing user to is_admin = true
    // if (!new_is_admin) new_is_admin = false;
    // new_is_admin = false;
    const hashedPassword = await bcrypt.hash(new_password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING username, password, first_name, last_name, email, is_admin`,
      [username, hashedPassword, new_first_name, new_last_name, new_email]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not add a user with username = ${username}.`,
        404
      );
    }

    const { password, first_name, last_name, email, is_admin } =
      results.rows[0];

    return new User(username, password, first_name, last_name, email, is_admin);
  }

  async delete() {
    await db.query(`DELETE FROM users WHERE username = $1`, [this.username]);
  }

  async save() {
    await db.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3, is_admin = $4 WHERE username = $5`,
      [
        this.first_name,
        this.last_name,
        this.email,
        this.is_admin,
        this.username,
      ]
    );
  }
}

module.exports = User;
