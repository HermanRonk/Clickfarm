const Joi = require("joi");
const pool = require("./db");

const handleRestore = async (restoreId) => {
  let guidUser = restoreId.slice(0, -9);
  let sgID = restoreId.slice(-8);

  if (!uuidValidator(guidUser) || !saveidValidator(sgID)) {
    return { error: "Validation failed" };
  }

  let conn;
  try {
    conn = await pool.getConnection();
    // fetch the save
    const [rows] = await conn.query(
      "SELECT savegame, persistent FROM saves WHERE user=? AND saveid=?",
      [guidUser, sgID]
    );

    if (rows.length === 0) {
      return { sg: "none" };
    }

    const objResponse = rows[0];
    objResponse._id = guidUser;
    objResponse._debug = "fetching savegame";

    return objResponse;
  } catch (error) {
    console.error(error);
    return { error: error };
  } finally {
    if (conn) conn.release();
  }
};

const handleSaveInit = async (uid, savegame) => {
  saveGameValidation(savegame);
  uuidValidator(uid);
  const rs = generateRandomString();
  const conn = await pool.getConnection();

  try {
    console.log("Initial save:" + rs);
    await conn.query(
      "INSERT INTO saves (user, savegame, persistent, saveid, modified) VALUES (?, ?, ?, ?, NOW())",
      [uid, savegame, 0, rs]
    );

    let initSave = {
      _id: uid,
      _debug: "Initial save",
    };

    return initSave;
  } finally {
    conn.release();
  }
};

const handleSavePers = async (uid, savegame) => {
  saveGameValidation(savegame);
  uuidValidator(uid);
  const rs = generateRandomString();
  const conn = await pool.getConnection();

  try {
    await conn.query(
      "INSERT INTO saves (user, savegame, persistent, saveid, modified) VALUES (?, ?, ?, ?, NOW())",
      [uid, savegame, 1, rs]
    );

    let persSave = {
      _id: uid,
      _saveid: uid + "-" + rs,
      _debug: "Persistent save",
    };

    return persSave;
  } finally {
    conn.release();
  }
};

const handleSave = async (uid, savegame) => {
  saveGameValidation(savegame);
  uuidValidator(uid);
  const conn = await pool.getConnection();

  try {
    // Regular save
    await conn.query(
      "UPDATE saves SET savegame=?, modified=NOW() WHERE user=? && persistent= 0",
      [savegame, uid]
    );

    let regularSave = {
      _id: uid,
      _debug: "Regular save",
    };

    return regularSave;
  } finally {
    conn.release();
  }
};

const generateRandomString = (length = 4) => {
  return require("crypto").randomBytes(length).toString("hex");
};

const saveidValidator = (saveid) => {
  const regex = /^[a-f0-9]{8}$/i;
  return regex.test(saveid);
};

const uuidValidator = (uid) => {
  const uuidValidation = Joi.string().pattern(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  );
  if (uuidValidation.validate(uid).error) {
    return 0;
  }
  return 1;
};

const saveGameValidation = (savegame) => {
  const decodedSavegame = Buffer.from(savegame, "base64").toString();
  if (!decodedSavegame) {
    res.status(400).send("Invalid savegame data");
    return;
  }

  try {
    let parsedSavegame = JSON.parse(decodedSavegame);
  } catch {
    res.status(400).send("Invalid savegame JSON data");
    return;
  }
};

module.exports = {
  handleRestore,
  handleSaveInit,
  handleSavePers,
  handleSave,
};
