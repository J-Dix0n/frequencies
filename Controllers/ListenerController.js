const pool = require("../database")

class ListenerController {
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
}

module.exports = ListenerController;