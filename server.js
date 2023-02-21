const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')
const ListenerController = require("./Controllers/ListenerController")
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
            res.redirect(`/user/${result[0].id}`)
        } else {
            res.redirect('/log_in');
        }
    } else if (req.body.user_type === "promoter") {

    };
})

app.get('/user/:id', async function (req, res) {
    res.render('/pages/user_page')
});

app.listen(3000);