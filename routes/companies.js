const express = require("express");
const router = new express.Router();
const Company = require("../models/company");
const { ensureIsLoggedIn, ensureIsAdmin } = require("../middleware/auth");
//

// must be logged in
// router.get("/", ensureIsLoggedIn, async (req, res, next) => {
// temporary: allow anyone to get a list of companies
router.get("/", async (req, res, next) => {
  // const q = req.query;
  // const user = req.user;
  // console.log("q = ", q);
  try {
    const companies = await Company.getAllCompanies(req.query, req.user);
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
});

// must be logged in
// router.get("/:ticker", ensureIsLoggedIn, async (req, res, next) => {
// temporary: allow anyone to request company by ticker
router.get("/:ticker", async (req, res, next) => {
  try {
    let { ticker } = req.params;
    ticker = ticker.toUpperCase();
    const company = await Company.getACompany(ticker);
    const {
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
      lastupdate,
    } = company;
    return res.json({
      company: {
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
        lastupdate,
      },
    });
  } catch (e) {
    return next(e);
  }
});

// must be an admin to add a company
router.post("/", ensureIsAdmin, async (req, res, next) => {
  try {
    let { ticker } = req.body;
    ticker = ticker.toUpperCase();
    const company = await Company.addACompany(ticker);
    return res.json({ message: "Company added to database", company });
  } catch (e) {
    return next(e);
  }
});

// must be an admin to delete a company
router.delete("/", ensureIsAdmin, async (req, res, next) => {
  try {
    let { ticker } = req.body;
    ticker = ticker.toUpperCase();
    const company = await Company.getACompany(ticker);
    // console.log("company", company);
    await company.delete();
    return res.json({ message: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

// must be an admin
// can only change the company name here for now
// all columns will be updated from the API
// this will not be used by the front end for now
router.patch("/:ticker", ensureIsAdmin, async (req, res, next) => {
  try {
    let { ticker } = req.params;
    ticker = ticker.toUpperCase();
    let { company_name } = req.body;
    const company = await Company.getACompany(ticker);
    if (!company_name) company_name = company.company_name;
    company.company_name = company_name;
    await company.save();
    return res.json(company);
  } catch (e) {
    return next(e);
  }
});
//
module.exports = router;
