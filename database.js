const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "music_application"
});

module.exports = pool;

async function getAll() {
try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM Users');
    client.end();
    console.log(result.rows)
    return result.rows;
    } catch (err) {

    }
}

getAll()