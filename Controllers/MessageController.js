class MessageController {
    constructor(pool) {
        this.client = pool
    }

    async send_message(sentuser_id, receiveuser_id, message) {
        await this.client.query('INSERT INTO messages (sentuser_id, receiveuser_id, message, date, type) VALUES ($1, $2, $3, $4, $5);', [sentuser_id, receiveuser_id, message, new Date(), "text"])
    }

    async send_event(sentuser_id, receiveuser_id, event_id) {
        await this.client.query('INSERT INTO messages (sentuser_id, receiveuser_id, message, date, type) VALUES ($1, $2, $3, $4, $5);', [sentuser_id, receiveuser_id, `/event/${event_id}`, new Date(), "event"])
    }

    async get_messaged_id(user_id) {
        const result = await this.client.query('SELECT sentuser_id, receiveuser_id FROM messages WHERE (sentuser_id = $1) OR (receiveuser_id = $1);', [user_id]);
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

    async get_friends_id(user_id) {
        const result = await this.client.query('SELECT friends FROM listeners WHERE id = $1', [user_id])
        let ids = []
        result.rows[0].friends.forEach((object) => {
            if (object.status === '2') {
                ids.push(object.listener_id)
            }
        });
        return ids;
    }

    async get_messages(user1, user2) {
        const result = await this.client.query('SELECT * FROM messages WHERE (sentuser_id = $1 AND receiveuser_id = $2) OR (sentuser_id = $2 AND receiveuser_id = $1);', [user1, user2]);
        return result.rows
    }
}

module.exports = MessageController;