const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

const config = require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Allow public folder
app.use( express.static(path.resolve(__dirname, '../public')));

// Global routes configuration
app.use( require('./api/routes/index') );


mongoose.connect(config.db.url,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
    (err, res) => {
    if (err) throw err;

    console.log('BD Mongo ONLINE');
});


app.listen(config.port, () => {
    console.log(`Listening port: ${config.port} - ${config.version}`);
});