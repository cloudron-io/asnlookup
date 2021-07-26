'use strict';

const fs = require('fs'),
    path = require('path'),
    debug = require('debug')('iptoasn'),
    ipcheck = require('ipcheck'),
    superagent = require('superagent');

const APNIC_RAW_TABLE_URL = 'http://thyme.apnic.net/current/data-raw-table';
const APNIC_USED_AUTNUMS_URL = 'http://thyme.apnic.net/current/data-used-autnums';
const MS_IN_DAYS = 1000 * 60 * 60 * 24;

let gCacheFilePath = '';
let gCache = {
    timestamp: 0,
    blocks: {},
    provider: {}
};

function lastUpdated() {
    if (gCache.timestamp === 0) return Infinity;

    const daysLastUpdated = parseInt(gCache.timestamp / MS_IN_DAYS);
    const daysNow = parseInt(Date.now() / MS_IN_DAYS);

    // something is wrong
    if (daysLastUpdated > daysNow) return Infinity;

    return daysNow - daysLastUpdated;
}

async function update() {
    debug('update local cache from https://thyme.apnic.net ...');

    const blocks = {};
    const provider = {};

    let blockData = await superagent.get(APNIC_RAW_TABLE_URL);
    blockData.text.split('\n').filter(function (l) { return !!l; }).forEach(function (l) {
        const data = l.split('\t');
        if (data.length !== 2) return;

        blocks[data[0]] = data[1];
    });

    const providerData = await superagent.get(APNIC_USED_AUTNUMS_URL);
    providerData.text.split('\n').filter(function (l) { return !!l; }).forEach(function (l) {
        const data = l.trim().split(' ');
        if (data.length !== 3) return;

        // slice to remove trailing ,
        provider[data[0]] = data[1].slice(0, -1);
    });

    gCache = {
        timestamp: Date.now(),
        blocks,
        provider
    };

    fs.writeFileSync(gCacheFilePath, JSON.stringify(gCache), 'utf8');
}

function lookup(ip) {
    if (typeof ip !== 'string' || !ip) return 'unkown';

    const block = Object.keys(gCache.blocks).find(function (b) {
        return ipcheck.match(ip, b);
    });

    if (!block) return null;
    if (!gCache.provider[gCache.blocks[block]]) return 'unknown';

    return gCache.provider[gCache.blocks[block]];
}

async function load() {
    debug(`Using cache file path ${gCacheFilePath}`);

    try {
        gCache = JSON.parse(fs.readFileSync(gCacheFilePath, 'utf8'));
    } catch (e) {
        debug('No iptoasn cache found. Call update() first');
    }
}

exports = module.exports = function (cacheFilePath) {
    gCacheFilePath = path.resolve(typeof cacheFilePath === 'string' && cacheFilePath ? cacheFilePath : '.iptoasn.cache');

    return {
        load,
        lastUpdated,
        update,
        lookup
    };
};
