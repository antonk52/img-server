'use strict';

/**
 * TODO:
 * - default webp support for whom supports it
 * - no width/height -> respond with original dimentions
 * - resize one dimention and preserve aspect ratio
 * - expiry header
 * - content type header
 */

const path = require('path');
const fs = require('fs');
const util = require('util');

const express = require('express');
const sharp = require('sharp');

const api = require('./api');
const {getFormatOptions} = require('./utils');

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
        height: query.height || query.h,
        interplace: query.interplace || 'Plain',
    };

    const img = path.parse(params.name);

    const wantedImgName = `${img.name}-${resizeOptions.width}x${resizeOptions.height}${img.ext}`;
    const wantedImgPath = path.join(__dirname, '../public', wantedImgName);

    const wantedImgExists = await fsExistsAsync(wantedImgPath);

    if (wantedImgExists) {
        return res.sendFile(wantedImgPath);
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

    const fomratMap = {
        '.webp': 'webp',
        '.png': 'png',
        '.jpg': 'jpeg',
        '.jpeg': 'jpeg',
    };
    const formatName = img.ext in fomratMap
        ? fomratMap[img.ext]
        : (hasWebpSupport ? 'webp' : 'jpeg');
    const formatOptions = getFormatOptions(query, formatName);
    console.log({formatName, formatOptions});
    transformer[formatName](formatOptions);

    // respond to client
    const imgReadableStream = fs
        .createReadStream(originalImgPath)
        .pipe(transformer)
    const fileDest = fs.createWriteStream(wantedImgPath);

    // send to client
    imgReadableStream.pipe(res);
    // save to disk
    imgReadableStream.pipe(fileDest);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`visit on http://localhost:${port}`));
