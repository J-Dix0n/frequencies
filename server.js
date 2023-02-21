let express = require('express');
let app = express();

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    let variable = "this is some text"
    res.render('pages/index', {variable: variable});
})

app.listen(3000);