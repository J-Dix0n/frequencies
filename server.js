const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const ListenerController = require("./Controllers/ListenerController")
const PromoterController = require("./Controllers/PromoterController")
const EventsController = require("./Controllers/EventsController")
const MessageController = require("./Controllers/MessageController")
let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({secret: "RANDOMSTRING", resave: true, saveUninitialized: true}))
//#######################

app.get('/', async function (req, res) {
    res.render('pages/index');
})

app.get('/sign_up_p', async function (req, res) {
    res.render('pages/sign_up_p');
})

app.post('/sign_up_p/success', async function (req, res) {
    const promoter = new PromoterController()
    await promoter.sign_up(req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.body.company_name, req.body.location)
    res.redirect('/log_in')
})

app.post('/sign_up/success', async function (req, res) {
    const listener = new ListenerController()
    await listener.sign_up(req.body.first_name, req.body.last_name, req.body.email, req.body.password)
    res.redirect('/log_in')
})

app.get('/log_in', async function (req, res) {
    res.render('pages/log_in')
})

app.post('/user', async function (req, res) {
    if (req.body.user_type === "listener") {
        const listener = new ListenerController()
        const result = await listener.log_in(req.body.email, req.body.password)
        if (result.length !== 0) {
            req.session.user = result[0]
            req.session.type = "listener"
            res.redirect(`/user/listener/${result[0].id}/profile`)
        } else {
            res.redirect('/log_in');
        }
    } else if (req.body.user_type === "promoter") {
        const promoter = new PromoterController()
        const result = await promoter.log_in(req.body.email, req.body.password)
        if (result.length !== 0) {
            req.session.user = result[0]
            req.session.type = "promoter"
            res.redirect(`/user/promoter/${result[0].id}`)
        } else {
            res.redirect('/log_in');
        }
    };
})

app.get('/user/listener/:id/profile', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    res.render('pages/user_page_listener', {user: user, type: type});
});

app.post('/user/listener/profile/success', async function (req, res) {
    const listener = new ListenerController()
    const preferences = {
        "genre": `${req.body.genre}`,
        "favourite_artist": `${req.body.artist}`
    };
    if (preferences.genre !== "" || preferences.artist !== "") {
        await listener.update_preferences(preferences, req.session.user.email)
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
    res.redirect('/user/listener/:id/profile')
})

app.post('/user/listener/:id/messages/:other/send', async function (req, res) {
    const message = new MessageController()
    await message.send_message(req.params.id, req.params.other, req.body.message)
    res.redirect(`/user/listener/${req.params.id}/messages/${req.params.other}`)
});

app.get('/user/listener/:id/messages/:other', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    const message = new MessageController()
    const conversation = await message.get_messages(req.params.id, req.params.other)
    res.render('pages/listener_conversation', {user: user, type: type, conversation: conversation, participants: [req.params.id, req.params.other]});
});

app.get('/user/listener/:id/messages', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    const info = [];
    const message = new MessageController()
    const listener = new ListenerController()
    const message_users = await message.get_messaged_id(user.id);
    for(let i = 0; i < (message_users).length; i++) {
        info.push({'id': message_users[i], 'name': await listener.get_name(message_users[i])})
    }
    res.render('pages/listener_messages', {user: user, type: type, info: info});
});

app.get('/user/promoter/:id', async function (req, res) {
    const eventClass = new EventsController();
    const listnerOrPromoter = req.session.type
    const promoter = req.session.user;

    const promoterId = promoter.id;
    const promoterEvents = await eventClass.fetchEventsByPromoter(promoterId);

    res.render('pages/user_page_promoter', {user: promoter, events: promoterEvents, type: listnerOrPromoter});
});

app.post('/user/promoter/event/:id', async function (req, res) {
    const eventClass = new EventsController();
    const deleteEventId = req.params.id

    await eventClass.deleteEvent(deleteEventId)

    res.redirect('/user/promoter/:id')
  });

app.get('/user/promoter/event/update/:id', async function (req, res) {
try {
    const eventClass = new EventsController();
    const eventId = req.params.id;
    const eventToUpdate = await eventClass.getEventById(eventId); 
    res.render('pages/update_event', { eventToUpdate, user: req.session.user });
} catch (err) {
    console.error(err);
}
});

app.post('/user/promoter/event/update/:id', async function (req, res) {
try {
    const eventClass = new EventsController();
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
    res.redirect(`/user/promoter/${req.session.user.id}`);
} catch (err) {
    console.error(err);
    res.sendStatus(500);
}
});

app.get('/post_event', async function (req, res) {
    const user = req.session.user;
    res.render('pages/post_event', {user: user});
  });

app.post('/post_event', async function(req, res) {
const promoterId = req.session.user;

artists = req.body.artist_list.split(", ")
output_list = []

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

const eventsController = new EventsController();
await eventsController.createEvent(event);
res.redirect('/events_list');
});
  
app.get('/events_list', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    const events = new EventsController();
    const list_events = await events.getEvents();
    res.render('pages/events_list', { events : list_events , user: user , type: type});
});

app.get('/event/:id', async function (req, res) {
    const event = new EventsController();
    const promoter = new PromoterController();

    const eventId = req.params.id;
    const eventInfo = await event.getEventById(eventId);

    const promoterInfo = await promoter.getPromoterById(eventInfo.promoter_id);

    res.render('pages/event_info', {event: eventInfo, promoter: promoterInfo});
});

app.get('/frequencies', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    const listeners = new ListenerController();
    const list_listeners = await listeners.list_users();
    res.render('pages/frequencies', {listeners : list_listeners, user: user, type: type });
});

app.post('/frequencies', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    const listeners = new ListenerController();
    const list_listeners = await listeners.filtered_users(req.body.filter);
    res.render('pages/frequencies', {listeners : list_listeners, user: user, type: type});
});

app.listen(3000);
