const pool = require("../database")

class MessageController {
    constructor() {

    }

    async send_message(sentuser_id, receiveuser_id, message) {
        const client = await pool.connect();
        await client.query('INSERT INTO messages (sentuser_id, receiveuser_id, message, date) VALUES ($1, $2, $3, $4);', [sentuser_id, receiveuser_id, message, new Date()])
    }

    async get_messaged_id(user_id) {
        const client = await pool.connect();
        const result = await client.query('SELECT sentuser_id, receiveuser_id FROM messages WHERE (sentuser_id = $1) OR (receiveuser_id = $1);', [user_id]);
        const ids = [];
        result.rows.forEach(function (object) {
            if (object.sentuser_id === user_id && !ids.includes(object.receiveuser_id)) {
                ids.push(object.receiveuser_id)
            } else if (object.receiveuser_id === user_id && !ids.includes(object.sentuser_id)) {
                ids.push(object.sentuser_id)
            }
        });
        return ids;
    }

    async get_messages(user1, user2) {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM messages WHERE (sentuser_id = $1 AND receiveuser_id = $2) OR (sentuser_id = $2 AND receiveuser_id = $1);', [user1, user2]);
        return result.rows
    }
}

module.exports = MessageController;