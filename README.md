# cloduron-io@iptoasn

Node.JS module for getting ASN for a given IP address. It uses data from
http://thyme.apnic.net/current/ .

Mostly inspired by https://www.npmjs.com/package/iptoasn but without native code and using async/await instead of callback style.

## Installation

`npm install --save cloduron-io@iptoasn`

## Description

This module downloads raw BGP table (~13MB) and ASN to name mapping (~2MB)
files from http://thyme.apnic.net/current/ and converts them into a more useful
format that allows for a quick search.

## Usage

```javascript
'use strict';

// you must pass a filepath in which database will be saved
const iptoasn = require('./index.js')('.iptoasn.cache');

(async function() {
    const testArray = [
        '8.8.8.8',
        '50.22.180.100',
        '1.2.3.4',
        '104.16.181.15',
        '127.0.0.1',
        'asd'
    ];

    await iptoasn.load();

    // check when the database was updated
    // lastUpdated are days
    // lastUpdated is Infinity if there's no database at all
    const lastUpdated = await iptoasn.lastUpdated();

    console.log(`Last updated ${lastUpdated} days ago.`);

    // update the database if it's older than 31 days
    // you must call .load() even if you don't update the database
    if (lastUpdated > 31) {
        console.log('Cache too old or never created. Updating...');
        await iptoasn.update();
    }

    testArray.forEach(function(ip) {
        console.log(ip, '-', iptoasn.lookup(ip));
    });
})();
```

Result of this sample script:

```
Last updated 0 days ago.
8.8.8.8 - LEVEL3
50.22.180.100 - SOFTLAYER
1.2.3.4 - null
104.16.181.15 - CLOUDFLARENET
127.0.0.1 - null
asd - null
```
