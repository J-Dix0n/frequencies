let express = require('express');
let app = express();
const UserController = require("./Controllers/UserController")
var bodyParser = require('body-parser')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', async function (req, res) {
    let cont = new UserController()
    cont.getAll().then((object) => {
        res.render('pages/index', {variable: object});
    })
})

app.get('/sign_up/listener', async function (req, res) {
    res.render('pages/sign_up_listener')
})

app.post('/log_in/listener', async function (req, res) {
    let user = new UserController();
    user.sign_up(req.body.first_name, req.body.last_name, req.body.email, req.body.password, "Listener")

    //res.render('pages/log_in');
})

app.get('/sign_up/promoter', async function (req, res) {
    res.render('pages/sign_up_promoter')
})

app.post('/log_in/promoter', async function (req, res) {
    let user = new UserController();
    user.sign_up_p(req.body.first_name, req.body.last_name, req.body.email, req.body.password, "Promoter", req.body.company_name, req.body.location)

    //res.render('pages/log_in');
})

app.listen(3000);