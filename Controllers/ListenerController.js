class ListenerController {
    constructor(client) {
        this.client = client
    }

    get_random(array) {
        return array[Math.floor((Math.random() * array.length))]
    }

    async list_users() {
        const result = await this.client.query('SELECT * FROM listeners;')
        return result.rows;
    }

    async list_specific_user(id) {
        const result = await this.client.query('SELECT * FROM listeners WHERE id = $1;', [id])
        return result.rows;
    }

    async update_picture(picture, email) {
        try {
            await this.client.query('UPDATE listeners SET picture = $1 WHERE email = $2', [picture, email])  
        }
        catch(err){
            console.log(err)
        }
    }


    async sign_up(first_name, last_name, email, password) {
        const result = await this.client.query('INSERT INTO listeners (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [first_name, last_name, email, password])
    }

    async log_in(email, password) {
        try {
            const result = await this.client.query('SELECT * FROM listeners WHERE email = $1 AND password = $2', [email, password]);
            return result.rows;
        }
        catch(err) {
            console.log(err)
        }
    }

    async update_preferences(preferences, email) {
        try {
            await this.client.query("UPDATE listeners SET preferences = '[]' || $1 ::jsonb WHERE email = $2", [preferences, email])
        }
        catch(err){
            console.log(err)
        }
    }

    async update_age(age, email) {
        try {
            await this.client.query('UPDATE listeners SET age = $1 WHERE email = $2', [age, email])
        }
        catch(err){
            console.log(err)
        }
    }

    async update_location(location, email) {
        try {
            await this.client.query('UPDATE listeners SET location = $1 WHERE email = $2', [location, email])
        }
        catch(err){
            console.log(err)
        }
    }

    async update_bio(bio, email) {
        try {
            await this.client.query('UPDATE listeners SET bio = $1 WHERE email = $2', [bio, email])
        }
        catch(err){
            console.log(err)
        }
    }

    async get_name(id) {
        const result = await this.client.query('SELECT first_name, last_name FROM listeners WHERE id = $1;', [id]);
        return `${result.rows[0].first_name} ${result.rows[0].last_name}`
    }

    async filtered_users(body_array) {
        let result = await this.client.query("SELECT * FROM listeners");
        let listeners = []
        result = result.rows;
        for (let i = 0; i < body_array.length; i++) {
            for (let j = 0; j < result.length; j++) {
                if (result[j].preferences[0].genre === body_array[i] && !listeners.includes(result[j] && result[j].preferences[0].genre != "----")) {
                    listeners.push(result[j]);
                }
            }
        }
        return listeners;
    }

    async swipe_right(swiper_id, swipee_id) {
        let result = await this.client.query("SELECT friends FROM listeners WHERE id = $1;", [swiper_id]);
        let swipee = await this.client.query("SELECT friends FROM listeners WHERE id = $1;", [swipee_id]);
        let friends = ""
        for (let i = 0; i < 2; i++) {
            if (i === 0) {
                friends = result.rows[0].friends;
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
                await this.client.query("UPDATE listeners SET friends = DEFAULT WHERE id = $1", [swiper_id]);
                for(let i = 0; i < friends.length; i++) {
                    await this.client.query("UPDATE listeners SET friends = friends || $1 ::jsonb WHERE id = $2", [friends[i], swiper_id])
                }
            } else if (i === 1) {
                friends = swipee.rows[0].friends;
                if(friends.filter((object) => object.listener_id === String(swiper_id)).length > 0) {
                    friends = friends.map(object => {
                        if(object.listener_id === String(swiper_id)) {
                            object.status = '2'
                        }
                        return object;
                    })
                } else {
                    friends.push({status: '1', listener_id: `${swiper_id}`});
                }
                await this.client.query("UPDATE listeners SET friends = DEFAULT WHERE id = $1", [swipee_id]);
                for(let i = 0; i < friends.length; i++) {
                    await this.client.query("UPDATE listeners SET friends = friends || $1 ::jsonb WHERE id = $2", [friends[i], swipee_id])
                }
            }
        }
    }

    async generate_user(body_array) {
        let users = await this.filtered_users(body_array);
        let choice = this.get_random(users);
        return choice
    }
}

module.exports = ListenerController;