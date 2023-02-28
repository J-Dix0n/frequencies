class PromoterController {
    constructor(client) {
        this.client = client
    }

    async list_users() {
        const result = await this.client.query('SELECT * FROM promoters;')
        return result;
    }

    async sign_up(first_name, last_name, email, password, company_name, location) {
        const result = await this.client.query('SELECT * FROM promoters WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            await this.client.query('INSERT INTO promoters (first_name, last_name, email, password, company_name, company_location) VALUES ($1, $2, $3, $4, $5, $6)', [first_name, last_name, email, password, company_name, location])
        } else {
            return "exists"
        }
    }

    async log_in(email, password) {
        try {
            const result = await this.client.query('SELECT * FROM promoters WHERE email = $1 AND password = $2', [email, password]);
            return result.rows;
        }
        catch(err) {
            console.log(err)
        }
    }

    async getPromoterById(id) {
        try {
          const query = 'SELECT * FROM promoters WHERE id = $1';
          const values = [id];
          const result = await this.client.query(query, values);
          return result.rows[0];
        } catch (err) {
          console.error(err);
        }
      }

}

module.exports = PromoterController;