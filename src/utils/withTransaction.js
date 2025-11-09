const pool = require('../config/db');

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await callback(client); // pass client to the business logic

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = withTransaction;
