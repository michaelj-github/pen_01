const express = require("express");
const router = new express.Router();
const Analysis = require("../models/analysis");
const { ensureIsThisUserOrIsAdmin } = require("../middleware/auth");
//

// must be admin or this user
router.get(
  "/:username/:ticker",
  ensureIsThisUserOrIsAdmin,
  async (req, res, next) => {
    try {
      let { username, ticker } = req.params;
      ticker = ticker.toUpperCase();
      username = username.toLowerCase();
      const analysis = await Analysis.getAnAnalysis(username, ticker);
      const { epsgrowthnext5y, highpenext5y, lowpenext5y, comment } = analysis;
      return res.json({
        analysis: {
          username,
          ticker,
          epsgrowthnext5y,
          highpenext5y,
          lowpenext5y,
          comment,
        },
      });
    } catch (e) {
      return next(e);
    }
  }
);

// must be admin or this user
// if exist, update, else add new
router.post("/", ensureIsThisUserOrIsAdmin, async (req, res, next) => {
  try {
    let {
      username,
      ticker,
      epsgrowthnext5y,
      highpenext5y,
      lowpenext5y,
      comment,
    } = req.body;
    ticker = ticker.toUpperCase();
    username = username.toLowerCase();
    const analysis = await Analysis.addOrUpdateAnAnalysis(
      username,
      ticker,
      epsgrowthnext5y,
      highpenext5y,
      lowpenext5y,
      comment
    );
    return res.json({
      message: "Analysis added or updated in the database",
      analysis,
    });
  } catch (e) {
    return next(e);
  }
});

// must be admin or this user
router.delete("/", ensureIsThisUserOrIsAdmin, async (req, res, next) => {
  try {
    let { username, ticker } = req.body;
    ticker = ticker.toUpperCase();
    username = username.toLowerCase();
    const analysis = await Analysis.getAnAnalysis(username, ticker);
    await analysis.delete();
    return res.json({ message: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

//
module.exports = router;
