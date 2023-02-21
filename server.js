let express = require('express');
let app = express();
const UserController = require("./Controllers/UserController")

app.set('view engine', 'ejs');

app.get('/', async function (req, res) {
    let cont = new UserController()
    cont.getAll().then((object) => {
        res.render('pages/index', {variable: object});
    })
})

app.get('/sign_up', async function (req, res) {
    res.render('pages/sign_up')
})

app.post('/log_in', async function (req, res) {
    let user = new UserController()
    console.log(params[username])
})

app.listen(3000);