'use strict'

const path = require('path');
const express = require('express');
const multer = require('multer');

const api = express.Router();
const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
});

api.use(function timeLog(_, __, next) {
  console.log('Time api: ', Date.now())
  next()
})

api.post('/add-img', upload.single('foobar'), (req, res) => {
    const {filename, size} = req.file;

    res.send({
        status: 'success',
        filename,
        size,
    });
});

module.exports = api;
