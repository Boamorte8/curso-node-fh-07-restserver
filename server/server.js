require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');

const env = require('./environment');
const port = process.env.PORT || 5588;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.use( require('./api/routes/user') );


mongoose.connect(env.dbUrl, (err, res) => {
    if (err) throw err;

    console.log('BD Mongo ONLINE');
});




app.listen(port, () => {
    console.log(`Listening port: ${port} - ${env.version}`);
});