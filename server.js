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

app.listen(3000);