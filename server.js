const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const ListenerController = require("./Controllers/ListenerController")
const PromoterController = require("./Controllers/PromoterController")
const EventsController = require("./Controllers/EventsController")
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
            res.redirect(`/user/listener/${result[0].id}`)
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

app.get('/user/listener/:id', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    res.render('pages/user_page_listener', {user: user, type: type});
});

app.get('/user/promoter/:id', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    res.render('pages/user_page_promoter', {user: user, type: type});
});

app.get('/post_event', async function (req, res) {
    res.render('pages/post_event');
  });

  app.post('/post_event', async function(req, res) {
    const promoterId = req.session.user;
    
    const event = {
        name: req.body.name,
        location: req.body.location,
        genre: req.body.genre,
        artist_list: req.body.artist_list,
        attendees: [],
        promoter_id: promoterId.id,
        price: req.body.price
      };
      const eventsController = new EventsController();
      await eventsController.createEvent(event);
      res.redirect('/events_list');
    });

  
app.get('/events_list', async function (req, res) {
    const events = new EventsController();
    const list_events = await events.getEvents();
    res.render('pages/events_list', { events : list_events });
});


app.listen(3000);
