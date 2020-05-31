const express = require('express');
const _ = require('underscore');

const app = express();

const Product = require('../../models/product');

const { verifyToken } = require('../middlewares/auth');

answerRequest = (err, res, productDB) => {
    if (err) {
        return res.status(500).json({
            ok: false,
            err
        });
    }
    if (!productDB) {
        return res.status(400).json({
            ok: false,
            err
        });
    }
    res.json({
        ok: true,
        product: productDB
    });
}

app.get('/product', verifyToken, (req, res) => {
    let since = req.query.since || 0;
    since = Number(since);

    let limit = req.query.limit || 5;
    limit = Number(limit);

    const query = {
        available: true
    };

    Product.find(query)
        .skip(since)
        .limit(limit)
        .sort('name')
        .populate('category', 'name')
        .populate('user', 'name email')
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Product.count(query, (err, count) => {
                res.json({
                    ok: true,
                    products,
                    count
                });
            });
        });
});

app.get('/product/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    Product.findById(id)
        .populate('category', 'name')
        .populate('user', 'name email')
        .exec((err, productDB) => {
            return answerRequest(err, res, productDB);
        })
});

// ===============================================
// Search product
// ===============================================
app.get('/products/search/:product', verifyToken, (req, res) => {
    const product = req.params.product;

    const regex = new RegExp(product, 'i');
    Product.find({ name: regex })
        .populate('category', 'name')
        .exec((err, productsDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productsDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                products: productsDB
            });
        })
});

app.post('/product', verifyToken, (req, res) => {
    const body = req.body;
    const user = req.user;

    const product = new Product({
        name: body.name,
        unitPrice: body.unitPrice,
        description: body.description ? body.description : '',
        category: body.category,
        user: user._id,
    });

    product.save((err, productDB) => {
        return answerRequest(err, res, productDB);
    });
});

app.put('/product/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'unitPrice', 'description', 'available', 'category']);
    body.user = req.user;
    const options = {
        new: true,
        runValidators: true,
    };

    Product.findByIdAndUpdate(id, body, options, (err, productDB) => {
        return answerRequest(err, res, productDB);
    });
});

app.delete('/product/:id', [verifyToken], (req, res) => {
    const id = req.params.id;

    const options = {
        new: true,
    };
    Product.findByIdAndUpdate(id, { available: false }, options, (err, productDB) => {
        if (!productDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Product not found'
                }
            });
        }
        return answerRequest(err, res, productDB);
    });
});

module.exports = app;
