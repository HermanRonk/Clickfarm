const pool = require("./db");

const sqlSave = async (resource, amount, responseObj) => {
  const conn = await pool.getConnection();
  await conn.execute(
    "UPDATE resources SET Amount = Amount + ? WHERE ResType = ?",
    [amount, resource]
  );
  await sqlGet(responseObj);
  conn.release();
};

const sqlPriceUpdate = async (token) => {
  const conn = await pool.getConnection();

  const newPriceOil = Math.floor(Math.random() * 21);
  const newPriceGrainLow = Math.floor(Math.random() * 500) + 1;
  const newPriceGrainHigh = Math.floor(Math.random() * 250) + 1;
  const newPriceFlourLow = Math.floor(Math.random() * 801) + 100;
  const newPriceFlourHigh = Math.floor(Math.random() * 351) + 100;

  const updatePromises = [
    conn.execute("UPDATE resources SET Price = ? WHERE ResType = ?", [
      newPriceOil,
      "Oil",
    ]),
    conn.execute("UPDATE resources SET Price = ? WHERE ResType = ?", [
      newPriceGrainHigh,
      "GrainHigh",
    ]),
    conn.execute("UPDATE resources SET Price = ? WHERE ResType = ?", [
      newPriceGrainLow,
      "GrainLow",
    ]),
    conn.execute("UPDATE resources SET Price = ? WHERE ResType = ?", [
      newPriceFlourLow,
      "FlourLow",
    ]),
    conn.execute("UPDATE resources SET Price = ? WHERE ResType = ?", [
      newPriceFlourHigh,
      "FlourHigh",
    ]),
  ];

  await Promise.all(updatePromises);

  conn.release();
};

const sqlPriceGet = async (responseObj) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.execute("SELECT ResType, Price FROM resources");
  rows.forEach((row) => {
    responseObj[row.ResType] = row.Price;
  });
  conn.release();
};

const sqlGet = async (responseObj) => {
  const conn = await pool.getConnection();
  const [rows] = await conn.execute("SELECT Amount, ResType FROM resources");
  rows.forEach((row) => {
    responseObj[row.ResType] = row.Amount;
  });
  responseObj._debug = "ophalen amount uit resources";
  conn.release();
};

module.exports = { sqlSave, sqlPriceUpdate, sqlGet, sqlPriceGet };
