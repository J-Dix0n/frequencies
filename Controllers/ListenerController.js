const pool = require("../database")

class ListenerController {
    constructor() {

    }

    async list_users() {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM listeners;')
        console.log(result.rows)
        return result;
    }

    async sign_up(first_name, last_name, email, password) {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO listeners (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [first_name, last_name, email, password])
        client.end();
    }

    async log_in(email, password) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM listeners WHERE email = $1 AND password = $2', [email, password]);
            return result.rows;
        }
        catch(err) {
            console.log(err)
        }
    }

    async get_name(id) {
        const client = await pool.connect();
        const result = await client.query('SELECT first_name, last_name FROM listeners WHERE id = $1;', [id]);
        return `${result.rows[0].first_name} ${result.rows[0].last_name}`
    }
}

module.exports = ListenerController;