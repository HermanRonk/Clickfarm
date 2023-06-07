const express = require("express");
const Joi = require("joi");
const router = express.Router();
const sqlFunctions = require("../controllers/resourceSqlunctions.js");

router.post("/update", async (req, res) => {
  const resource = req.body.reso;

  // validate whether the resource is a string of max 20 characters
  const resourceValidation = Joi.string().max(20);
  if (resourceValidation.validate(resource).error) {
    res.status(400).send("Invalid resource");
    return;
  }

  const amount = parseInt(req.body.amount);

  let responseObj = {};

  await sqlFunctions.sqlSave(resource, amount, responseObj);
  return res.status(200).json(responseObj);
});

// add a get route saleinfo
router.get("/saleinfo", async (req, res) => {
  let responseObj = {};
  await sqlFunctions.sqlGet(responseObj);
  return res.status(200).json(responseObj);
});

router.get("/getprice", async (req, res) => {
  let responseObj = {};
  await sqlFunctions.sqlPriceGet(responseObj);
  return res.status(200).json(responseObj);
});

module.exports = router;
