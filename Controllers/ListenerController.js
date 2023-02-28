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

    async update_picture(picture, email) {
        try {
            await this.client.query('UPDATE listeners SET picture = $1 WHERE email = $2', [picture, email])  
        }
        catch(err){
            console.log(err)
        }
    }


    async sign_up(first_name, last_name, email, password) {
        await this.client.query('INSERT INTO listeners (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)', [first_name, last_name, email, password])
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

    async update_preferences(preferences, id, current_artist, current_genres) {
        try {
            let text_filter = preferences[0].genre.replace(/[-,]/g, '')
            if (text_filter != "") {
                let split = preferences[0].genre.split(",");

                await this.client.query("UPDATE listeners SET preferences = '[]' WHERE id = $1", [id]);
                for(let i=0; i < split.length; i++) {
                    if (split[i] != "----") {
                        await this.client.query("UPDATE listeners SET preferences = preferences || $1 ::jsonb WHERE id = $2", [{"genre": `${split[i]}`}, id]);
                    }
                } 
            } else {
                let split = ""
                if (current_genres.includes(",")) {
                    split = current_genres.split(",");
                } else {
                    split = current_genres
                }
                

                await this.client.query("UPDATE listeners SET preferences = '[]' WHERE id = $1", [id]);
                for(let i=0; i < split.length; i++) {
                    if (split[i] != "----") {
                        await this.client.query("UPDATE listeners SET preferences = preferences || $1 ::jsonb WHERE id = $2", [{"genre": `${split[i]}`}, id]);
                    }
                } 
            }
            
            if (preferences[1].favourite_artist != "") {
                await this.client.query("UPDATE listeners SET preferences = preferences || $1 ::jsonb WHERE id = $2", [{"favourite_artist": `${preferences[1].favourite_artist}`}, id]);
            } else {
                await this.client.query("UPDATE listeners SET preferences = preferences || $1 ::jsonb WHERE id = $2", [{"favourite_artist": `${current_artist}`}, id]);
            }
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

    async update_playlist(playlist, id) {
        try {
            await this.client.query('UPDATE listeners SET playlist = $1 WHERE id = $2', [playlist, id])
        }
        catch(err){
            console.log(err)
        }
    }
    
    async get_name(id) {
        const result = await this.client.query('SELECT first_name, last_name FROM listeners WHERE id = $1;', [id]);
        return `${result.rows[0].first_name} ${result.rows[0].last_name}`
    }

    async filtered_users_genre(body_array, user_id) {
        let result = await this.client.query("SELECT * FROM listeners");
        let user_friends = await this.client.query("SELECT friends FROM listeners WHERE id = $1", [user_id]);
        result = result.rows;
        user_friends = user_friends.rows[0].friends
        let denied = [`${user_id}`]
        user_friends.forEach((object) => {
            if (object.status > 1 && !denied.includes(object.listener_id)) {
                denied.push(object.listener_id)
            }
        })
        result = result.filter((object) => {
            return !denied.includes(String(object.id))
        })
        let listeners = [[], [], [], [], []]
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                let genres = 0
                for (let i = 0; i < result[j].preferences.length; i++) {
                    if (body_array.includes(result[j].preferences[i].genre)) {
                        genres += 1;
                    }
                }
                listeners[4 - genres].push(result[j])
            }
        }
        return listeners;
    }

    async filtered_users_location(location, user_id) {
        let result = await this.client.query("SELECT * FROM listeners");
        let user_friends = await this.client.query("SELECT friends FROM listeners WHERE id = $1", [user_id]);
        result = result.rows;
        user_friends = user_friends.rows[0].friends
        let denied = [`${user_id}`]
        user_friends.forEach((object) => {
            if (object.status > 1 && !denied.includes(object.listener_id)) {
                denied.push(object.listener_id)
            }
        })
        result = result.filter((object) => {
            return !denied.includes(String(object.id))
        })
        let listeners = []
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                if (result[j].location === location) {
                    listeners.push(result[j])
                }
            }
        }
        return listeners;
    }

    async filtered_users_artist(artist, user_id) {
        let result = await this.client.query("SELECT * FROM listeners");
        let user_friends = await this.client.query("SELECT friends FROM listeners WHERE id = $1", [user_id]);
        result = result.rows;
        user_friends = user_friends.rows[0].friends
        let denied = [`${user_id}`]
        user_friends.forEach((object) => {
            if (object.status > 1 && !denied.includes(object.listener_id)) {
                denied.push(object.listener_id)
            }
        })
        result = result.filter((object) => {
            return !denied.includes(String(object.id))
        })
        let listeners = []
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                if (await this.get_favourite_artist(result[j].id) === artist) {
                    listeners.push(result[j])
                }
            }
        }
        return listeners;
    }

    async filtered_users_events(event_ids, user_id) {
        let result = await this.client.query("SELECT * FROM listeners");
        let user_friends = await this.client.query("SELECT friends FROM listeners WHERE id = $1", [user_id]);
        result = result.rows;
        user_friends = user_friends.rows[0].friends
        let denied = [`${user_id}`]
        user_friends.forEach((object) => {
            if (object.status > 1 && !denied.includes(object.listener_id)) {
                denied.push(object.listener_id)
            }
        })
        result = result.filter((object) => {
            return !denied.includes(String(object.id))
        })
        let listeners = []
        if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
                let user_event_ids = await this.get_events_id(result[j].id)
                if (user_event_ids.filter((id) => {return event_ids.includes(id)}).length > 0) {
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
                    friends.push({status: '4', listener_id: `${swipee_id}`});
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

    async swipe_left(swiper_id, swipee_id) {
        let result = await this.client.query("SELECT friends FROM listeners WHERE id = $1;", [swiper_id]);
        let swipee = await this.client.query("SELECT friends FROM listeners WHERE id = $1;", [swipee_id]);
        let friends = ""
        for (let i = 0; i < 2; i++) {
            if (i === 0) {
                friends = result.rows[0].friends;
                if(friends.filter((object) => object.listener_id === String(swipee_id)).length > 0) {
                    friends = friends.map(object => {
                        if(object.listener_id === String(swipee_id)) {
                            object.status = '3'
                        }
                        return object;
                    })
                } else {
                    friends.push({status: '3', listener_id: `${swipee_id}`});
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
                            object.status = '3'
                        }
                        return object;
                    })
                } else {
                    friends.push({status: '3', listener_id: `${swiper_id}`});
                }
                await this.client.query("UPDATE listeners SET friends = DEFAULT WHERE id = $1", [swipee_id]);
                for(let i = 0; i < friends.length; i++) {
                    await this.client.query("UPDATE listeners SET friends = friends || $1 ::jsonb WHERE id = $2", [friends[i], swipee_id])
                }
            }
        }
    }
    
    async unfollowPromoter(position, id) {
        try {
            await this.client.query(`UPDATE listeners SET following = following - ${position} WHERE id = $1;`, [id])
        } catch (err) {
          console.error(err);
        }
      }

    async followPromoter(promoterId, id) {
    try {
        await this.client.query(`UPDATE listeners SET following = following || '[{"promoter_id": "${promoterId}"}]' WHERE id = $1;`, [id])
    } catch (err) {
        console.error(err); 
    }
    }

    async addEventStatus(id, eventId, status){
    try {
        await this.client.query(`UPDATE listeners SET events = events || '[{"status": "${status}", "event_id": "${eventId}"}]' WHERE id = $1;`, [id])
    } catch (err) {
        console.error(err); 
    }
    }

    async updateEventStatus(id, indexOfEventStatus, status){
        try {
            await this.client.query(`UPDATE listeners SET events = jsonb_set(events, '{${indexOfEventStatus},status}', '${status}'::jsonb) WHERE id = $1;`, [id])
        } catch (err) {
            console.error(err); 
        }
    } 

    async generate_user(body_array, user_id, filter) {
        if (filter === "Genre") {
            let users = await this.filtered_users_genre(body_array, user_id);
            let result = []
            for (let i = 0; i < users.length; i++) {
                if (users[i].length > 0 && result.length === 0) {
                    result = users[i];
                }
            }
            let choice = this.get_random(result);
            if (choice === undefined) {
                choice = "null";
            }
            return choice
        } else if (filter === "Location") {
            let users = await this.filtered_users_location(body_array, user_id)
            let choice = this.get_random(users);
            if (choice === undefined) {
                choice = "null";
            }
            return choice
        } else if (filter === "Favourite Artist") {
            let users = await this.filtered_users_artist(body_array, user_id);
            let choice = this.get_random(users);
            if (choice === undefined) {
                choice = "null";
            }
            return choice
        } else if (filter === "Events") {
            let users = await this.filtered_users_events(body_array, user_id);
            let choice = this.get_random(users);
            if (choice === undefined) {
                choice = "null";
            }
            console.log(choice)
            return choice
        }
    }

    async get_genres(user_id) {
        let user = await this.client.query("SELECT preferences FROM listeners WHERE id = $1;", [user_id]);
        user = user.rows[0].preferences
        let genres = []
        for(let i = 0; i < user.length; i++) {
            if (user[i].genre != undefined) {
                genres.push(user[i].genre)
            }
        }
        return genres;
    }

    async get_favourite_artist(user_id) {
        let user = await this.client.query("SELECT preferences FROM listeners WHERE id = $1;", [user_id]);
        user = user.rows[0].preferences
        let artist = []
        for(let i = 0; i < user.length; i++) {
            if (user[i].favourite_artist != undefined) {
                artist.push(user[i].favourite_artist)
            }
        }
        return artist[0];
    }

    async get_events_id(user_id) {
        let user = await this.client.query("SELECT events FROM listeners WHERE id = $1;", [user_id]);
        user = user.rows[0].events
        let events = []
        for(let i = 0; i < user.length; i++) {
            if (user[i].event_id != undefined) {
                events.push(user[i].event_id)
            }
        }
        return events;
    }
}


module.exports = ListenerController;