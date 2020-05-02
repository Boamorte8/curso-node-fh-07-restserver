const uuid = require('uuid');

const version = 'DEV_' + uuid.v4();

const mongodbUrl = 'mongodb://localhost:27017/cafe';

exports.version = version;
exports.dbUrl = mongodbUrl;
