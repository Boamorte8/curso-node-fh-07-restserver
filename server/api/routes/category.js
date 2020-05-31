const express = require('express');
const _ = require('underscore');

const app = express();

const Category = require('../../models/category');

const { verifyToken, verifyPermission } = require('../middlewares/auth');

answerRequest = (err, res, categoryDB) => {
    if (err) {
        return res.status(500).json({
            ok: false,
            err
        });
    }
    if (!categoryDB) {
        return res.status(400).json({
            ok: false,
            err
        });
    }
    res.json({
        ok: true,
        category: categoryDB
    });
}

app.get('/category', verifyToken, (req, res) => {
    Category.find()
        .sort('description')
        .populate('user', 'name email')
        .exec((err, categories) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Category.count({}, (err, count) => {
                res.json({
                    ok: true,
                    categories,
                    count
                });
            });
        });
});

app.get('/category/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    Category.findById(id, (err, category) => {
        return answerRequest(err, res, category);
    })
});

app.post('/category', verifyToken, (req, res) => {
    const body = req.body;
    const user = req.user;

    const category = new Category({
        name: body.name,
        description: body.description,
        user: user._id,
    });

    category.save((err, categoryDB) => {
        return answerRequest(err, res, categoryDB);
    });
});

app.put('/category/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'description']);
    const options = {
        new: true,
        runValidators: true,
    };

    Category.findByIdAndUpdate(id, body, options, (err, categoryDB) => {
        return answerRequest(err, res, categoryDB);
    });
});

app.delete('/category/:id', [verifyToken, verifyPermission], (req, res) => {
    const id = req.params.id;

    const options = {};
    Category.findByIdAndRemove(id, options, (err, categoryDB) => {
        return answerRequest(err, res, categoryDB);
    })
});


module.exports = app;
