const { Pool } = require("pg");
const { DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DATABASE} = require("./serverConfig");

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

module.exports = pool;