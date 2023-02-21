const pool = require("../database")

class UserController {
    constructor() {

    }

    async getAll() {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT * FROM Users');
            client.end();
            return result.rows;
        } catch (err) {
        
        }
    }

    async sign_up(first_name, last_name, email, password, choice) {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5);', [first_name, last_name, email, password, choice]);
        client.end();
    }

    async sign_up_p(first_name, last_name, email, password, choice, company_name, location) {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO users (first_name, last_name, email, password, role, company_name, location) VALUES ($1, $2, $3, $4, $5, $6, $7);', [first_name, last_name, email, password, choice, company_name, location]);
        client.end();
    }

    async log_in(first_name, last_name, email, password, role) {
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1;', [email]);
        client.end();
    }
}

module.exports = UserController;