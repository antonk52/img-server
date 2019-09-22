'use strict';

/**
 * TODO:
 * - default webp support for whom supports it
 * - no width/height -> respond with original dimentions
 * - resize one dimention and preserve aspect ratio
 * - jpeg options
 */

const path = require('path');
const fs = require('fs');
const util = require('util');

const express = require('express');
const sharp = require('sharp');

const api = require('./api');

const fsExistsAsync =util.promisify(fs.exists);
const app = express();

// DEV mode
// serves static from public dir & home page has a form to upload new images
if (process.env.NODE_ENV === 'development') {
    app.use(express.static('public'));
    app.get('/', (_, res) => res.sendFile(path.resolve('./dev/index.html')));
}

app.use('/api', api);

// handle nested routes
app.get('/*/*', (_, res) => console.log('missed') || res.sendStatus(404));

app.use((req, _, next) => {
    req.hasWebpSupport = !!req.headers.accept && req.headers.accept.includes('image/webp');
    next();
})

app.get('/:name', async ({query, params, hasWebpSupport}, res) => {

    const resizeOptions = {
        width: query.width || query.w,
        height: query.height || query.h || query.width || query.w,
        interplace: query.interplace || 'Plain',
    };

    const img = path.parse(params.name);

    const seekingImgName = `${img.name}-${resizeOptions.width}x${resizeOptions.height}${img.ext}`;
    const seekingImgPath = path.join(__dirname, '../public', seekingImgName);

    const seekingImgExists = await fsExistsAsync(seekingImgPath);

    if (seekingImgExists) {
        return res.sendFile(seekingImgPath);
    }

    const originalImgPath = path.resolve('uploads', img.name);
    const originalImgExists = await fsExistsAsync(originalImgPath);

    if (!originalImgExists) {
        return res.sendStatus(404);
    }

    const transformer = sharp();

    if (!isNaN(Number(resizeOptions.width))) {
        transformer.resize({
            width: Number(resizeOptions.width),
            height: Number(resizeOptions.height),
        });
    }

    // TODO see toFormat
    // https://sharp.pixelplumbing.com/en/stable/api-output/#toformat
    if (img.ext === '') {
        if (hasWebpSupport) {
            transformer.webp();
        } else {
            transformer.jpeg();
        }
    } else {
        if (img.ext === '.png') {
            transformer.png();
        }
        if (img.ext === '.jpg' || img.ext === '.jpeg') {
            transformer.jpeg();
        }
        if (img.ext === '.webp') {
            transformer.webp();
        }
    }

    // respond to client
    const imgReadableStream = fs
        .createReadStream(originalImgPath)
        .pipe(transformer)
        // .pipe(res);
    const fileDest = fs.createWriteStream(seekingImgPath);

    // send to client
    imgReadableStream.pipe(res);
    // save to disk
    imgReadableStream.pipe(fileDest);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`visit on http://localhost:${port}`));
