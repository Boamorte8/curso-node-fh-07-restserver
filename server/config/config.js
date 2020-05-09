const dotenv = require('dotenv');
const uuid = require('uuid');

const version = 'V_' + uuid.v4();

const envFound = dotenv.config() ;// load the .env file
if (!envFound) {
    console.log('File .env does not exist');
}

// =================================================================
// Environment
// =================================================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =================================================================
// BD
// =================================================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = process.env.DB_HOST_LOCAL;
} else {
    urlDB = process.env.DB_HOST;
}


module.exports = {
    port: process.env.PORT || 5588,
    logs: {
        level: process.env.LOG_LEVEL || 'silly'
    },
    auth: {
        secret: process.env.SECRET
    },
    db: {
        url: urlDB
    },
    version
}