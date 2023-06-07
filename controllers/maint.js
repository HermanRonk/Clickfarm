const pool = require("./db");

async function deleteOldSaves() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "DELETE FROM saves WHERE persistent = 0 AND modified < DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)"
    );
  } catch (error) {
    console.error(error);
  } finally {
    if (conn) conn.release();
  }
}

async function consolidateSales() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Create temporary table
    await conn.query(
      "CREATE TEMPORARY TABLE temp_table AS SELECT user, item, SUM(profit) as profit, SUM(amount) as amount FROM sales WHERE created > NOW() - INTERVAL 1 DAY GROUP BY user, item HAVING COUNT(*) > 2"
    );

    // Insert the consolidated lines into the original table
    await conn.query(
      "INSERT INTO sales (user, item, profit, amount) SELECT user, item, profit, amount FROM temp_table"
    );

    // Delete the old lines from the original table
    await conn.query(
      "DELETE FROM sales WHERE (user, item) IN (SELECT user, item FROM temp_table)"
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    console.error(error);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  deleteOldSaves,
  consolidateSales,
};
