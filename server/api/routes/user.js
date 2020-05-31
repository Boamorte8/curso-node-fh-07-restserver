const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

const config = require('../../config/config');

const User = require('../../models/user');

const { verifyToken, verifyPermission } = require('../middlewares/auth');

answerRequest = (err, res, userDB) => {
    if (err) {
        return res.status(400).json({
            ok: false,
            err
        });
    }
    res.json({
        ok: true,
        user: userDB
    });
}

app.get('/version', (req, res) => {
    res.json(`Hello World LOCAL! - API Working - ${new Date().toString()} - ${config.version}`);
});

app.get('/user', verifyToken, (req, res) => {

    let since = req.query.since || 0;
    since = Number(since);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    const query = {
        state: true
    };

    User.find(query, 'name email img role state google')
        .skip(since)
        .limit(limit)
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            User.count(query, (err, count) => {
                res.json({
                    ok: true,
                    users,
                    count
                });
            });
        });
});

app.post('/user', [verifyToken, verifyPermission], (req, res) => {
    const body = req.body;

    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        role: body.role,
    });

    user.save((err, userDB) => {
        return answerRequest(err, res, userDB);
    });

});

app.put('/user/:id', [verifyToken, verifyPermission], (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state']);
    const options = {
        new: true,
        runValidators: true,
    };

    User.findByIdAndUpdate(id, body, options, (err, userDB) => {
        return answerRequest(err, res, userDB);
    });
});


app.delete('/user/:id', verifyToken, (req, res) => {
    const id = req.params.id;

    const options = {
        new: true,
    };

    // For remove record physically
    // const options = {};
    // User.findByIdAndRemove(id, options, (err, userDB) => {

    // Only update the state of the record
    User.findByIdAndUpdate(id, { state: false }, options, (err, userDB) => {
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'User not found'
                }
            });
        }
        return answerRequest(err, res, userDB);
    });


});


module.exports = app;
