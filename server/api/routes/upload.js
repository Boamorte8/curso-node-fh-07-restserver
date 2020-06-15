'use strict';

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const User = require('../../models/user');
const Product = require('../../models/product');

// default options
// app.use(fileUpload({ useTempFiles: true }));
app.use(fileUpload());

app.put('/upload/:type/:id', function(req, res) {
    const type = req.params.type;
    const id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'File did not is selected'
            }
        });
    }

    const typesAllowed = ['products', 'users'];
    if (!typesAllowed.includes(type)) {
        return res.status(500).json({
            ok: false,
            err: {
                message: 'Types allowed are ' + typesAllowed.join(', ')
            }
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    let fileName = file.name.split('.');
    let extension = fileName[fileName.length - 1];

    const extensionsAllowed = ['png', 'jpg', 'gif', 'jpeg'];

    if (!extensionsAllowed.includes(extension)) {
        return res.status(500).json({
            ok: false,
            err: {
                message: 'Files allowed need these extensions ' + extensionsAllowed.join(', ')
            }
        });
    }

    // Change name to file name
    let nameFile = `${ id }-${ new Date().getMilliseconds() }.${ extension }`

    // Use the mv() method to place the file somewhere on your server
    file.mv(`uploads/${ type }/${ nameFile }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (type === 'users') {
            imageUser(id, res, nameFile);
        } else {
            imageProduct(id, res, nameFile);
        }

    });
});

function imageUser(id, res, nameFile) {
    User.findById(id, function (err, userDB) {
        if (err) {
            deleteFile(nameFile, 'users');

            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!userDB) {
            deleteFile(nameFile, 'users');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'User not found'
                }
            });
        }

        deleteFile(userDB.img, 'users');

        userDB.img = nameFile;

        userDB.save((err, userDBSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                user: userDBSaved,
                img: nameFile
            });
        });
    });

}

function imageProduct(id, res, nameFile) {
    Product.findById(id, function (err, productDB) {
        if (err) {
            deleteFile(nameFile, 'products');

            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!productDB) {
            deleteFile(nameFile, 'products');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Product not found'
                }
            });
        }

        deleteFile(productDB.img, 'products');

        productDB.img = nameFile;

        productDB.save((err, productDBSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                product: productDBSaved,
                img: nameFile
            });
        });
    });
}

function deleteFile(fileName, type) {
    let pathImage = path.resolve(__dirname, `../../../uploads/${type}/${fileName}`);
    if ( fs.existsSync(pathImage) ) {
        fs.unlinkSync(pathImage);
    }
}

module.exports = app;
