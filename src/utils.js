'use strict'

const defaultFormatOptions = {
    jpeg: {
        quality: 80,
        progressive: true,
    },
    png: {
        quality: 100,
        progressive: false,
    },
    webp: {
        quality: 80,
        lossless: false,
    },
};

const getFormatOptions = (query, formatName) => {
    const result = {};
    if ('quality' in query && Number(query.quality) <= 100 && Number(query.quality)) {
        result.quality = Number(query.quality);
    }
    if ('q' in query && Number(query.q) <= 100 && Number(query.q)) {
        result.quality = Number(query.q);
    }
    if (formatName !== 'webp' && 'progressive' in query && ['1', '0'].includes(query.progressive)) {
        result.progressive = query.progressive === '1';
    }
    if (formatName !== 'webp' && 'prog' in query && ['1', '0'].includes(query.prog)) {
        result.progressive = query.prog === '1';
    }
    if (formatName === 'webp' && 'lossless' in query && ['1', '0'].includes(query.lossless)) {
        result.lossless = query.lossless === '1';
    }
    return Object.assign(
        {},
        defaultFormatOptions[formatName],
        result,
    );
};

module.exports = {
    getFormatOptions,
};
