const pool = require("../database")

class PromoterController {
    constructor() {

    }

    async list_users() {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM promoters;')
        console.log(result.rows)
        return result;
    }

    async sign_up(first_name, last_name, email, password, company_name, location) {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO promoters (first_name, last_name, email, password, company_name, company_location) VALUES ($1, $2, $3, $4, $5, $6)', [first_name, last_name, email, password, company_name, location])
        client.end();
    }

    async log_in(email, password) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM promoters WHERE email = $1 AND password = $2', [email, password]);
            return result.rows;
        }
        catch(err) {
            console.log(err)
        }
    }

    async getPromoterById(id) {
        try {
          const client = await pool.connect();
          const query = 'SELECT * FROM promoters WHERE id = $1';
          const values = [id];
          const result = await client.query(query, values);
          client.end();
          return result.rows[0];
        } catch (err) {
          console.error(err);
        }
      }

}

module.exports = PromoterController;