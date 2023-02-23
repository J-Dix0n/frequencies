const pool = require("../database")

class ListenerController {
    constructor() {

    }

    async list_users() {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM listeners;')
        return result.rows;
    }

    async list_specific_user(id) {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM listeners WHERE id = $1;', [id])
        return result.rows;
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

    async update_preferences(preferences, email) {
        const client = await pool.connect();
        try {
            await client.query("UPDATE listeners SET preferences = '[]' || $1 ::jsonb WHERE email = $2", [preferences, email])  
        }
        catch(err){
            console.log(err)
        }
    }

    async update_age(age, email) {
        const client = await pool.connect();
        try {
            await client.query('UPDATE listeners SET age = $1 WHERE email = $2', [age, email])  
        }
        catch(err){
            console.log(err)
        }
    }

    async update_location(location, email) {
        const client = await pool.connect();
        try {
            await client.query('UPDATE listeners SET location = $1 WHERE email = $2', [location, email])  
        }
        catch(err){
            console.log(err)
        }
    }

    async update_bio(bio, email) {
        const client = await pool.connect();
        try {
            await client.query('UPDATE listeners SET bio = $1 WHERE email = $2', [bio, email])  
        }
        catch(err){
            console.log(err)
        }
    }

    async get_name(id) {
        const client = await pool.connect();
        const result = await client.query('SELECT first_name, last_name FROM listeners WHERE id = $1;', [id]);
        return `${result.rows[0].first_name} ${result.rows[0].last_name}`
    }

    async filtered_users() {
        const client = await pool.connect();
        let result = await client.query("SELECT * FROM listeners");
        let listeners = []
        result = result.rows;
        for (let i = 0; i < arguments.length; i++) {
            for (let j = 0; j < result.length; j++) {
                if (result[j].preferences[0].genre === arguments[i] && !listeners.includes(result[j])) {
                    listeners.push(result[j]);
                }
            }
        }
        return listeners;
    }

    async swipe_right(swiper_id, swipee_id) {
        const client = await pool.connect();
        let result = await client.query("SELECT friends FROM listeners WHERE id = $1;", [swiper_id]);
        let friends = result.rows[0].friends;

        if(friends.filter((object) => object.listener_id === String(swipee_id)).length > 0) {
            friends = friends.map(object => {
                if(object.listener_id === String(swipee_id)) {
                    object.status = '2'
                }
                return object;
            })
        } else {
            friends.push({status: '1', listener_id: `${swipee_id}`});
        }
        await client.query("UPDATE listeners SET friends = DEFAULT WHERE id = $1", [swiper_id]);
        for(let i = 0; i < friends.length; i++) {
            await client.query("UPDATE listeners SET friends = friends || $1 ::jsonb WHERE id = $2", [friends[i], swiper_id])
        }
    }
}

module.exports = ListenerController;