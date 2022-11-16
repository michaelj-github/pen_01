const e = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

class Company {
  constructor(
    ticker,
    company_name,
    epsgrowth3y,
    epsgrowth5y,
    revenuesharegrowth5y,
    revenuegrowth5y,
    penormalizedannual,
    epsnormalizedannual,
    epsexclextraitemsttm,
    high52weekhigh,
    low52weeklow,
    dividendpershareannual,
    dividendspersharettm,
    revenuepersharettm,
    shareoutstanding,
    previousclose,
    growthrate,
    orderby,
    lastupdate
  ) {
    this.ticker = ticker;
    this.company_name = company_name;
    this.epsgrowth3y = epsgrowth3y;
    this.epsgrowth5y = epsgrowth5y;
    this.revenuesharegrowth5y = revenuesharegrowth5y;
    this.revenuegrowth5y = revenuegrowth5y;
    this.penormalizedannual = penormalizedannual;
    this.epsnormalizedannual = epsnormalizedannual;
    this.epsexclextraitemsttm = epsexclextraitemsttm;
    this.high52weekhigh = high52weekhigh;
    this.low52weeklow = low52weeklow;
    this.dividendpershareannual = dividendpershareannual;
    this.dividendspersharettm = dividendspersharettm;
    this.revenuepersharettm = revenuepersharettm;
    this.shareoutstanding = shareoutstanding;
    this.previousclose = previousclose;
    this.growthrate = growthrate;
    this.orderby = orderby;
    this.lastupdate = lastupdate;
  }

  static async getAllCompanies(searchFilters = {}, user) {
    // console.log("searchFilters = ", searchFilters);
    //
    // oldest update timestamp (lastupdate)
    // searchFilters.oldest // ?oldest=true
    // this will override any other filters
    //
    // filter by partial ticker or name
    // searchFilters.search // ?search=abc
    //
    // analyzed or not // ?analyzed=true
    //
    // dividend paid only // ?dividends=true
    //
    // undervalued only // ?undervalued=true
    //
    // order by orderby DESC (revenue * growthrate * value)
    // add sorts for dividend yield, revenue size large or small
    let query = `SELECT ticker, 
                        company_name,
                        epsgrowth3y,
                        epsgrowth5y,
                        revenuesharegrowth5y,
                        revenuegrowth5y,
                        penormalizedannual,
                        epsnormalizedannual,
                        epsexclextraitemsttm,
                        high52weekhigh,
                        low52weeklow,
                        dividendpershareannual,
                        dividendspersharettm,
                        revenuepersharettm,
                        shareoutstanding,
                        previousclose,
                        growthrate,
                        orderby,
                        lastupdate
                  FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    // console.log("searchFilters = ", searchFilters);
    if (searchFilters.oldest) {
      // console.log("searchFilters.oldest = ", searchFilters.oldest);
      query += " ORDER BY lastUpdate LIMIT 1";
    } else {
      if (searchFilters.search) {
        queryValues.push(`%${searchFilters.search}%`);
        whereExpressions.push(
          `(company_name ILIKE $${queryValues.length} OR ticker ILIKE $${queryValues.length})`
        );
      }

      if (searchFilters.dividends) {
        whereExpressions.push("dividendspersharettm > 0"); // only with dividends
      }

      if (searchFilters.undervalued) {
        whereExpressions.push("orderby > 0"); // only undervalued
      }

      // whereExpressions.push("epsgrowth3y > 0");
      // whereExpressions.push("epsgrowth5y > 0");
      // whereExpressions.push("revenuegrowth5y > 0");
      // whereExpressions.push("revenuesharegrowth5y > 0");
      // whereExpressions.push("penormalizedannual > 0");
      // whereExpressions.push("epsnormalizedannual > 0");
      // whereExpressions.push("epsexclextraitemsttm > 0");

      if (searchFilters.analyzed) {
        // console.log("user = ", user);
        whereExpressions.push(
          `ticker IN (SELECT ticker FROM analyses WHERE username = '${user.username}')`
        );
      }

      if (whereExpressions.length > 0) {
        query += " WHERE " + whereExpressions.join(" AND ");
        query += " ORDER BY orderBy DESC";
      }
    }

    // console.log("query = ", query);
    // console.log("queryValues = ", queryValues);
    const results = await db.query(query, queryValues);

    if (results.rows.length === 0) {
      throw new ExpressError(`Could not find any companies.`, 404);
    }

    const companies = results.rows.map(
      (r) =>
        new Company(
          r.ticker,
          r.company_name,
          r.epsgrowth3y,
          r.epsgrowth5y,
          r.revenuesharegrowth5y,
          r.revenuegrowth5y,
          r.penormalizedannual,
          r.epsnormalizedannual,
          r.epsexclextraitemsttm,
          r.high52weekhigh,
          r.low52weeklow,
          r.dividendpershareannual,
          r.dividendspersharettm,
          r.revenuepersharettm,
          r.shareoutstanding,
          r.previousclose,
          r.growthrate,
          r.orderby,
          r.lastupdate
        )
    );
    return companies;
  }

  // get a company by ticker symbel
  static async getACompany(ticker) {
    ticker = ticker.toUpperCase();
    const results = await db.query(
      `SELECT ticker, 
                  company_name,
                  epsgrowth3y,
                  epsgrowth5y,
                  revenuesharegrowth5y,
                  revenuegrowth5y,
                  penormalizedannual,
                  epsnormalizedannual,
                  epsexclextraitemsttm,
                  high52weekhigh,
                  low52weeklow,
                  dividendpershareannual,
                  dividendspersharettm,
                  revenuepersharettm,
                  shareoutstanding,
                  previousclose,
                  growthrate,
                  orderby,
                  lastupdate
          FROM companies 
          WHERE ticker = $1`,
      [ticker]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not find a company with ticker = ${ticker}.`,
        404
      );
    }
    // return results.rows[0];
    const company = results.rows[0];
    return new Company(
      company.ticker,
      company.company_name,
      company.epsgrowth3y,
      company.epsgrowth5y,
      company.revenuesharegrowth5y,
      company.revenuegrowth5y,
      company.penormalizedannual,
      company.epsnormalizedannual,
      company.epsexclextraitemsttm,
      company.high52weekhigh,
      company.low52weeklow,
      company.dividendpershareannual,
      company.dividendspersharettm,
      company.revenuepersharettm,
      company.shareoutstanding,
      company.previousclose,
      company.growthrate,
      company.orderby,
      company.lastupdate
    );
  }

  // to add a new company, just need ticker and optional timestamp
  // const theLastUpdate = "2022-08-20 17:56:39.013444-04";
  // using an older timestamp will enable the front end update process
  static async addACompany(
    new_ticker,
    new_lastupdate = "2022-08-20 17:56:39.013444-04"
  ) {
    if (!new_ticker) {
      throw new ExpressError("The compay ticker symbol is required.", 400);
    }

    new_ticker = new_ticker.toUpperCase();
    const checkResults = await db.query(
      `SELECT ticker FROM companies WHERE ticker = $1`,
      [new_ticker]
    );
    if (checkResults.rows.length !== 0) {
      throw new ExpressError(
        `Can not add a duplicate company with ticker = ${new_ticker}.`,
        400
      );
    }

    const results = await db.query(
      `INSERT INTO companies (ticker, lastupdate)
      VALUES ($1, $2)
      RETURNING ticker, lastupdate`,
      [new_ticker, new_lastupdate]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(
        `Could not add a company with ticker = ${ticker}.`,
        404
      );
    }

    const { ticker } = results.rows[0];

    return new Company(ticker);
  }

  // these may be the only instance methoda needed for now
  // could change to static and eliminate the constructor for this class?
  // keep for future use
  async delete() {
    await db.query(`DELETE FROM companies WHERE ticker = $1`, [this.ticker]);
  }

  // will not be used by the front end for now, keep for future use
  async save() {
    await db.query(`UPDATE companies SET company_name = $1 WHERE ticker = $2`, [
      this.company_name,
      this.ticker,
    ]);
  }
}

module.exports = Company;
