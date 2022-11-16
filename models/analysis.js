const db = require("../db");
const ExpressError = require("../expressError");
const Company = require("../models/company");
const User = require("../models/user");

class Analysis {
  constructor(
    username,
    ticker,
    epsgrowthnext5y = "",
    highpenext5y = "",
    lowpenext5y = "",
    comment = ""
  ) {
    this.username = username;
    this.ticker = ticker;
    this.epsgrowthnext5y = epsgrowthnext5y;
    this.highpenext5y = highpenext5y;
    this.lowpenext5y = lowpenext5y;
    this.comment = comment;
  }

  static async getAnAnalysis(username, ticker) {
    const results = await db.query(
      `SELECT username, ticker, epsgrowthnext5y, highpenext5y, lowpenext5y, comment FROM analyses WHERE username = $1 AND ticker = $2`,
      [username.toLowerCase(), ticker.toUpperCase()]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not find analysis with username = ${username} and ticker = ${ticker}.`,
        404
      );
    }
    const analysis = results.rows[0];
    console.log("analysis = ", analysis);
    return new Analysis(
      analysis.username,
      analysis.ticker,
      analysis.epsgrowthnext5y,
      analysis.highpenext5y,
      analysis.lowpenext5y,
      analysis.comment
    );
  }

  // if exist, update, else add new
  // if updating, must send values for all columns or
  // no value for a column to set that column value to ''
  static async addOrUpdateAnAnalysis(
    new_username,
    new_ticker,
    new_epsgrowthnext5y,
    new_highpenext5y,
    new_lowpenext5y,
    new_comment
  ) {
    new_ticker = new_ticker.toUpperCase();
    new_username = new_username.toLowerCase();
    const checkResults = await db.query(
      `SELECT username, ticker FROM analyses WHERE username = $1 AND ticker = $2`,
      [new_username, new_ticker]
    );
    let results;
    if (checkResults.rows.length === 0) {
      // these do not need to be sequential
      await User.getAUser(new_username); // check to see if user exists
      await Company.getACompany(new_ticker); // check to see if company exists
      results = await db.query(
        `INSERT INTO analyses
                 (username, ticker, epsgrowthnext5y, highpenext5y, lowpenext5y, comment)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING username, ticker, epsgrowthnext5y, highpenext5y, lowpenext5y, comment`,
        [
          new_username,
          new_ticker,
          new_epsgrowthnext5y || "",
          new_highpenext5y || "",
          new_lowpenext5y || "",
          new_comment || "",
        ]
      );
    } else {
      results = await db.query(
        `UPDATE analyses SET
                 epsgrowthnext5y=$1, highpenext5y=$2, lowpenext5y=$3, comment=$4
                 WHERE ticker=$5 AND username=$6
                 RETURNING ticker, username, epsGrowthNext5Y, highPeNext5Y, lowPeNext5Y, comment`,
        [
          new_epsgrowthnext5y || "",
          new_highpenext5y || "",
          new_lowpenext5y || "",
          new_comment || "",
          new_ticker,
          new_username,
        ]
      );
    }
    const {
      username,
      ticker,
      epsgrowthnext5y,
      highpenext5y,
      lowpenext5y,
      comment,
    } = results.rows[0];
    return new Analysis(
      username,
      ticker,
      epsgrowthnext5y,
      highpenext5y,
      lowpenext5y,
      comment
    );
  }

  async delete() {
    await db.query(`DELETE FROM analyses WHERE ticker = $1 AND username=$2`, [
      this.ticker,
      this.username,
    ]);
  }
}

module.exports = Analysis;
