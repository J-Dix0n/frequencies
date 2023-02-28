class App {
    constructor() {

    }
    async application() {
        const express = require('express');
        const session = require('express-session')
        const bodyParser = require('body-parser')
        const ListenerController = require("./Controllers/ListenerController")
        const PromoterController = require("./Controllers/PromoterController")
        const EventsController = require("./Controllers/EventsController")
        const MessageController = require("./Controllers/MessageController")
        const multer = require("multer")
        const path = require ('path')
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'public')
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname))
            }
        })
        const upload = multer({storage : storage})

        let app = express();
        app.set('view engine', 'ejs');
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.use(express.static((path.join(__dirname, './public'))))
        app.use(session({secret: "RANDOMSTRING", resave: true, saveUninitialized: true}))
        const pool = require("./database")
        const client = await pool.connect();
        const sessionChecker = (req, res, next) => {
            if (!req.session.user) {
                res.redirect("/log_in");
            } else {
                next();
            }
        };
        const userPermission = (req, res, next) => {
            if (req.session.user.id != req.params.id && req.session.type === "listener") {
                res.redirect(`/user/listener/${req.session.user.id}/profile`);
            } else if (req.session.type === "promoter") {
                res.redirect(`/user/promoter/${req.session.user.id}/profile`);
            } else {
                next();
            }
        };
        //#######################

        app.get('/', async function (req, res) {
            let error = ""
            if (req.session.error !== undefined) {
                error = req.session.error
            }
            res.render('pages/index', {error: error});
        })

        app.get('/sign_up_p', async function (req, res) {
            let error = ""
            if (req.session.error !== undefined) {
                error = req.session.error
            }
            res.render('pages/sign_up_p', {error: error});
        })

        app.post('/sign_up_p/success', async function (req, res) {
            const promoter = new PromoterController(client)
            if (/\w+@\w+\.com/.test(req.body.email) && req.body.password.length >= 8 && req.body.first_name !== "" && req.body.last_name !== "" && req.body.email !== "" && req.body.password !== "" && req.body.company_name !== "" && req.body.location !== "") {
                const result = await promoter.sign_up(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.company_name, req.body.location)
                if (result !== "exists") {
                    req.session.error = ""
                    res.redirect('/log_in')
                } else {
                    req.session.error = "That email already exists"
                    res.redirect('/sign_up_p')
                }
            } else {
                req.session.error = "Incorrect email or password"
                res.redirect('/sign_up_p')
            }
        })

        app.post('/sign_up/success', async function (req, res) {
            const listener = new ListenerController(client)
            await listener.sign_up(req.body.first_name, req.body.last_name, req.body.email, req.body.password)
            res.redirect('/log_in')
        })

        app.get('/log_in', async function (req, res) {
            res.render('pages/log_in')
        })

        app.post('/log_out', async function (req, res) {
            req.session.destroy();
            res.redirect('/log_in');
        })

        app.post('/user', async function (req, res) {
            if (req.body.user_type === "listener") {
                const listener = new ListenerController(client)
                const result = await listener.log_in(req.body.email, req.body.password)
                if (result.length !== 0) {
                    req.session.user = result[0]
                    req.session.type = "listener"
                    req.session.random_pick = "null"
                    res.redirect(`/user/listener/${result[0].id}/profile`)
                } else {
                    res.redirect('/log_in');
                }
            } else if (req.body.user_type === "promoter") {
                const promoter = new PromoterController(client)
                const result = await promoter.log_in(req.body.email, req.body.password)
                if (result.length !== 0) {
                    req.session.user = result[0]
                    req.session.type = "promoter"
                    req.session.random_pick = "null"
                    res.redirect(`/user/promoter/${result[0].id}/profile`)
                } else {
                    res.redirect('/log_in');
                }
            };
        })

        app.get('/user/listener/:id/upload', sessionChecker, userPermission, (req, res) => {
            const user = req.session.user;
            const type = req.session.type;
            res.render('pages/upload', {user: user, type: type});
        });

        app.post('/user/listener/:id/upload', upload.single("image"), async (req, res) => {
            const listener = new ListenerController(client);
            await listener.update_picture(req.file.filename, req.session.user.email)
            req.session.user.picture = req.file.filename;
            res.redirect(`/user/listener/${req.session.user.id}/profile`);
        });

        app.get('/user/listener/:id/profile', sessionChecker, userPermission, async function (req, res) {
            const user = req.session.user;
            const type = req.session.type;
            const listener = new ListenerController(client)
            const promoterClass = new PromoterController(client)
            const followers = []

            for (let promoter of user.following) {
                const followedPromoter = await promoterClass.getPromoterById(promoter.promoter_id)
                followers.push(followedPromoter)
              }

            const friends = [];
            
            const friend_users = await listener.get_friends_id(user.id);
            for(let i = 0; i < (friend_users).length; i++) {
                friends.push({'id': friend_users[i], 'name': await listener.get_name(friend_users[i])})
            }
            const eventInfo = new EventsController(client);
            const attendingEvents = [];
            const attendingEventsInfo = []

            user.events.forEach(event => {
                if (event.status === "2" || event.status === 2 ) {
                attendingEvents.push(event.event_id);
                }
            });

            for (const event of attendingEvents) {
                const attendingEvent = await eventInfo.getEventById(event);
                attendingEventsInfo.push(attendingEvent);
            }

            
            let genres = await listener.get_genres(req.session.user.id);
            let fave_artist = await listener.get_favourite_artist(req.session.user.id);

            let error = "";
            if(req.session.error !== undefined) {
                error = req.session.error
            }

            res.render('pages/user_page_listener', {user: user, type: type, events: attendingEventsInfo, friends: friends, followers: followers, fave_artist: fave_artist, genres: genres, error: error});
        });

        app.post('/user/listener/profile/success', async function (req, res) {
            const listener = new ListenerController(client)
            const genres = {
                "genre": `${req.body.genre}`
            };
            const favourite_artist = {
                "favourite_artist": `${req.body.artist}`
            }
            const preferences = [genres, favourite_artist];
            if (preferences !== "") {
                await listener.update_preferences(preferences, req.session.user.id, await listener.get_favourite_artist(req.session.user.id), await listener.get_genres(req.session.user.id))
            }
            if (req.body.age !== "") { 
                await listener.update_age(req.body.age, req.session.user.email)
            }
            if (req.body.location !== "") { 
                await listener.update_location(req.body.location, req.session.user.email)
            }
            if (req.body.bio !== "") { 
                await listener.update_bio(req.body.bio, req.session.user.email)
            }
            const result = await listener.list_specific_user(req.session.user.id)
            req.session.user = result[0]
            res.redirect(`/user/listener/${req.session.user.id}/profile`)
        })
        
        app.post('/user/listener/profile/playlist/update', async function(req, res) {
            const listener = new ListenerController(client)
            if (req.body.playlist !== "") { 
                await listener.update_playlist(req.body.playlist, req.session.user.id)
            }
            const result = await listener.list_specific_user(req.session.user.id)
            req.session.user = result[0]
            res.redirect('/user/listener/:id/profile')
        })

        app.post('/user/listener/profile/playlist/update', async function(req, res) {
            const listener = new ListenerController(client)
            if (req.body.playlist !== "") { 
                await listener.update_playlist(req.body.playlist, req.session.user.id)
            }
            const result = await listener.list_specific_user(req.session.user.id)
            req.session.user = result[0]
            res.redirect('/user/listener/:id/profile')
        })

        app.post('/user/listener/:id/messages/:other/send', async function (req, res) {
            const message = new MessageController(client)
            if(req.body.message !== "") {
                const body_message = req.body.message;
                const trimmed = body_message.trim();
                await message.send_message(req.params.id, req.params.other, trimmed);
                res.redirect(`/user/listener/${req.params.id}/messages/${req.params.other}`)
            } else {
                res.redirect(`/user/listener/${req.params.id}/messages/${req.params.other}`)
            }
            
            
        });

        app.post('/user/listener/:id/messages/:other/send_event', async function (req, res) {
            const message = new MessageController(client)
            await message.send_event(req.params.id, req.params.other, req.body.event_id)
            res.redirect(`/user/listener/${req.params.id}/messages/${req.params.other}`)
        });

        app.get('/user/listener/:id/messages/:other', sessionChecker, userPermission, async function (req, res) {
            const user = req.session.user;
            const type = req.session.type;
            const message = new MessageController(client)
            const eventcont = new EventsController(client)
            let events = await eventcont.getEvents();
            const conversation = await message.get_messages(req.params.id, req.params.other)
            res.render('pages/listener_conversation', {user: user, type: type, conversation: conversation, participants: [req.params.id, req.params.other], events: events});
        });

        app.get('/user/listener/:id/messages', sessionChecker, userPermission, async function (req, res) {
            const user = req.session.user;
            const type = req.session.type;
            const info = [];
            const friends = [];
            const message = new MessageController(client)
            const listener = new ListenerController(client)
            const message_users = await message.get_messaged_id(user.id);
            const friend_users = await message.get_friends_id(user.id);
            for(let i = 0; i < (message_users).length; i++) {
                info.push({'id': message_users[i], 'name': await listener.get_name(message_users[i])})
            }
            for(let i = 0; i < (friend_users).length; i++) {
                friends.push({'id': friend_users[i], 'name': await listener.get_name(friend_users[i])})
            }
            res.render('pages/listener_messages', {user: user, type: type, info: info, friends: friends});
        });

        app.get('/user/promoter/:id/profile', sessionChecker, async function (req, res) {
            const eventClass = new EventsController(client);
            const promoterClass = new PromoterController(client);
            const listenerClass = new ListenerController(client);
            const listnerOrPromoter = req.session.type
            const promoter = await promoterClass.getPromoterById(req.params.id);
            const follow = await listenerClass.list_specific_user(req.session.user.id);
            const promoterEvents = await eventClass.fetchEventsByPromoter(promoter.id);
            req.session.user.following = follow[0].following;
            let followerList =  req.session.user.following
            
            let followed = '';
            let position = -1;

            if (listnerOrPromoter === 'listener') {
                for(let i = 0; i < followerList.length; i++) {
                    if (followerList[i].promoter_id === req.params.id) {
                        followed = 'true'
                        position = i;
                    } 
                }
            }

            res.render('pages/user_page_promoter', {user: promoter, events: promoterEvents, type: listnerOrPromoter, followed: followed, position: position});
        });

        app.post('/user/unfollow', async function (req, res) {
            const listenerClass = new ListenerController(client);
            const promoterId = req.body.promoter_id
            const position = req.body.position;
            await listenerClass.unfollowPromoter(position, req.session.user.id)
            
            res.redirect(`/user/promoter/${promoterId}/profile`)
        });

        app.post('/user/follow', async function (req, res) {
            const listenerClass = new ListenerController(client);
            const promoterId = req.body.promoter_id
            await listenerClass.followPromoter(promoterId, req.session.user.id)
            
            res.redirect(`/user/promoter/${promoterId}/profile`)
        });
        
        app.post('/user/promoter/event/:id', async function (req, res) {
            const eventClass = new EventsController();
            const deleteEventId = req.params.id
            const promoterId = req.session.user.id

            await eventClass.deleteEvent(deleteEventId)

            res.redirect(`/user/promoter/${promoterId}/profile`)
        });

        app.get('/user/promoter/event/update/:id', sessionChecker, async function (req, res) {
        try {
            const eventClass = new EventsController(client);
            const eventId = req.params.id;
            const eventToUpdate = await eventClass.getEventById(eventId); 
            res.render('pages/update_event', { eventToUpdate, user: req.session.user });
        } catch (err) {
            console.error(err);
        }
        });

        app.post('/user/promoter/event/update/:id', async function (req, res) {
        try {
            const eventClass = new EventsController(client);
            const eventId = req.params.id;

            const updatedEvent = {
            name: req.body.name,
            location: req.body.location,
            genre: req.body.genre,
            artist_list: JSON.parse(req.body.artist_list),
            attendees: JSON.parse(req.body.attendees),
            promoter_id: req.session.user.id,
            price: req.body.price,
            date: req.body.date
            };

            await eventClass.updateEvent(eventId, updatedEvent); 
            res.redirect(`/user/promoter/${req.session.user.id}/profile`);
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
        });

        app.get('/post_event', sessionChecker, async function (req, res) {
            const user = req.session.user;
            res.render('pages/post_event', {user: user});
        });

        app.post('/post_event', async function(req, res) {
        const promoterId = req.session.user;

        const artists = req.body.artist_list.split(", ");
        let outputArr = [];

        for (let i = 0; i < artists.length; i++) {
            let artistObj = {
                artist: artists[i],
                genre: req.body.genre
        };
        outputArr.push(artistObj);
        }

        const event = {
            name: req.body.name,
            location: req.body.location,
            genre: req.body.genre,
            artist_list: outputArr,
            attendees: [],
            promoter_id: promoterId.id,
            price: req.body.price,
            date: req.body.date
        };

        const eventsController = new EventsController(client);
        await eventsController.createEvent(event);
        res.redirect('/events_list');
        });
        
        app.get('/events_list', sessionChecker, async function (req, res) {
            const user = req.session.user;
            const type = req.session.type;
            const events = new EventsController(client);
            const list_events = await events.getEvents();
            res.render('pages/events_list', { events : list_events , user: user , type: type});
        });

        app.get('/event/:id', sessionChecker, async function (req, res) {
            const event = new EventsController(client);
            const promoter = new PromoterController(client);
            const eventId = req.params.id;
            const eventInfo = await event.getEventById(eventId);
            const promoterInfo = await promoter.getPromoterById(eventInfo.promoter_id);
            const user_type = req.session

            res.render('pages/event_info', {event: eventInfo, promoter: promoterInfo, user: user_type});
        });

        app.post('/event/:id/status', async function (req, res) {
            const listenerClass = new ListenerController(client);
            const eventId = req.params.id;
            const status = req.body['event-status'];
            const listenerInfo = await listenerClass.list_specific_user(req.session.user.id);

            const indexOfEventStatus = listenerInfo[0].events.findIndex(event => event.event_id === eventId);
            if(indexOfEventStatus === -1){
                await listenerClass.addEventStatus(req.session.user.id, eventId, status);
            }
            else {
                await listenerClass.updateEventStatus(req.session.user.id, indexOfEventStatus, status);
            }

            const listenerInfoSessionUpdate = await listenerClass.list_specific_user(req.session.user.id);
            req.session.user.events = listenerInfoSessionUpdate[0].events

            res.redirect(`/event/${eventId}`);
          });

        app.get('/frequencies', sessionChecker, async function (req, res) {
            const user = req.session.user;
            const type = req.session.type;
            if (req.session.filter === undefined) {
                req.session.filter = "Genre"
            }
            const listeners = new ListenerController(client);
            if (user.preferences === [] || user.location === null || user.events === []) {
                req.session.error = "Need to update preferences, location and events."
                res.redirect('/user/listener/:id/profile')
            }
            let random_pick = ""
            if (req.session.filter === "Genre") {
                let genres = await listeners.get_genres(req.session.user.id);
                random_pick = await listeners.generate_user(genres, req.session.user.id, "Genre")
            } else if (req.session.filter === "Location") {
                random_pick = await listeners.generate_user(req.session.user.location, req.session.user.id, "Location")
            } else if (req.session.filter === "Favourite Artist") {
                let artist = await listeners.get_favourite_artist(req.session.user.id);
                random_pick = await listeners.generate_user(artist, req.session.user.id, "Favourite Artist")
            } else if (req.session.filter === "Events") {
                let events = await listeners.get_events_id(req.session.user.id);
                random_pick = await listeners.generate_user(events, req.session.user.id, "Events")
            }
            let genres = await listeners.get_genres(req.session.user.id);
            let fave_artist = await listeners.get_favourite_artist(random_pick.id);
            
            res.render('pages/frequencies', {user: user, type: type , random_pick: random_pick, filter: req.session.filter, fave_artist, genres});
        });

        app.post('/frequencies/search', async function (req, res) {
            req.session.filter = req.body.filter
            res.redirect('/frequencies')
        });

        app.post('/frequencies/:id/confirm/:other', async function (req, res) {
            const listeners = new ListenerController(client);
            await listeners.swipe_right(req.params.id, req.params.other);
            res.redirect('/frequencies')
        })

        app.post('/frequencies/:id/deny/:other', async function (req, res) {
            const listeners = new ListenerController(client);
            await listeners.swipe_left(req.params.id, req.params.other);
            res.redirect('/frequencies')
        })

        app.listen(3000);
        process.on('SIGINT', function () {
            console.log("Interupt signal")
            console.log("Ending client")
            client.end()
            process.exit();
        })
    }
}

server = new App()
server.application()