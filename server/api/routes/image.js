const express = require('express');

const fs = require('fs');
const path = require('path');

const app = express();

const { verifyTokenImg } = require('../middlewares/auth');

app.get('/img/:type/:img', verifyTokenImg, (req, res) => {
    const type = req.params.type;
    const img = req.params.img;

    let noImgPath = path.resolve(__dirname, `../../assets/no-image.jpg`);

    let pathImage = path.resolve(__dirname, `../../../uploads/${type}/${img}`);
    if ( fs.existsSync(pathImage) ) {
        res.sendFile(pathImage);
    } else {
        res.sendFile(noImgPath);
    }
})

module.exports = app;
