const express = require('express');
const bcrypt = require('bcrypt');
const {OAuth2Client} = require('google-auth-library');

const app = express();

const config = require('../../config/config');
const jwt = require('../../utils/jwt');

const client = new OAuth2Client(config.auth.google_client_id);
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

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.auth.google_client_id,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }

    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
}
// verify().catch(console.error);

app.post('/google', async (req, res) => {
    const token = req.body.idtoken;
    let googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            err
        });
    });

    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (userDB) {
            if (!userDB.google) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You have an account with that email. Do login'
                    }
                });
            } else {
                let token = jwt.sign({
                    user: userDB,
                }, config.auth.secret,
                // Expires on 30 days
                { expiresIn: process.env.EXPIRATION_TOKEN });
                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            }
        } else {
            // If is a new user,
            let user = new User();
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                let token = jwt.sign({
                    user: userDB,
                }, config.auth.secret,
                // Expires on 30 days
                { expiresIn: process.env.EXPIRATION_TOKEN });
                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            });

        }
    });
    // res.json({
    //     user: googleUser
    // });
});

module.exports = app;
