const express = require('express');
const bcrypt = require('bcrypt');

const app = express();

const config = require('../../config/config');
const jwt = require('../../utils/jwt');

const User = require('../../models/user');

app.post('/login', (req, res) => {

    const body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(User) or password invalid'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'User or (password) invalid'
                }
            });
        }

        let token = jwt.sign({
            user: userDB,
        }, config.auth.secret,
        // Expires on 30 days
        { expiresIn: process.env.EXPIRATION_TOKEN });

        res.json({
            ok: true,
            user: userDB,
            token
        });
    });

});

module.exports = app;
