let express = require('express');
let app = express();
const ListenerController = require("./Controllers/ListenerController")
var bodyParser = require('body-parser')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', async function (req, res) {
    res.render('pages/index');
})

app.listen(3000);