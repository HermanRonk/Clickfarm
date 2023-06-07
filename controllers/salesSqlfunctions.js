const pool = require('./db');

const saveSale = async (uid, type_transaction, amount, profit) => {
    const conn = await pool.getConnection();
    try {
        const query = 'INSERT INTO sales (user, item, profit, amount) VALUES (?, ?, ?, ?)';
        await conn.query(query, [uid, type_transaction, profit, amount]);
    } finally {
        conn.release();
    }
};

module.exports = { saveSale };
