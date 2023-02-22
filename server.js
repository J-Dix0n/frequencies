const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const ListenerController = require("./Controllers/ListenerController")
const PromoterController = require("./Controllers/PromoterController")
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
            res.redirect(`/user/${result[0].id}/profile`)
        } else {
            res.redirect('/log_in');
        }
    } else if (req.body.user_type === "promoter") {
        const promoter = new PromoterController()
        const result = await promoter.log_in(req.body.email, req.body.password)
        if (result.length !== 0) {
            req.session.user = result[0]
            req.session.type = "promoter"
            res.redirect(`/user/${result[0].id}/profile`)
        } else {
            res.redirect('/log_in');
        }
    };
})

app.get('/user/:id/profile', async function (req, res) {
    const user = req.session.user;
    const type = req.session.type;
    res.render('pages/user_page', {user: user, type: type});
});

app.post('/user/profile/success', async function (req, res) {
    const listener = new ListenerController()
    await listener.update_preferences(`${req.body.genre}, ${req.body.fave_artist}`, req.session.user.email)
    await listener.update_age(req.body.age, req.session.user.email)
    await listener.update_location(req.body.location, req.session.user.email)
    await listener.update_bio(req.body.bio, req.session.user.email)
    res.redirect('/user/:id/profile')
})

app.listen(3000);