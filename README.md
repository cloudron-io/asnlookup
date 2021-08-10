# asnlookup

Node.JS module for getting ASN for a given IP address. It uses data from
http://thyme.apnic.net/current/ .

Mostly inspired by https://www.npmjs.com/package/iptoasn but without native code and using async/await instead of callback style.

## Installation

`npm install --save asnlookup`

## Description

This module downloads raw BGP table (~13MB) and ASN to name mapping (~2MB)
files from http://thyme.apnic.net/current/ and converts them into a more useful
format that allows for a quick search.

WARNING: To improve the lookup speed by a lot only /16 at most is currently supported as the first 2 bytes of the address is used for quick lookup!
On the upside this makes it more specific for ranges covered by various ASNs

## Usage

```javascript
'use strict';

// you must pass a filepath for the local cache, otherwise .asnlookup.cache will be used
const asnlookup = require('./index.js')('.asnlookup.cache');

(async function() {
    const testArray = [
        '8.8.8.8',
        '50.22.180.100',
        '1.2.3.4',
        '104.16.181.15',
        '127.0.0.1',
        'asd'
    ];

    // call .load() for an attempt to load the local cache, this will require 10s of MB of memory!
    await asnlookup.load();

    // check when the cache was updated
    // lastUpdated are days
    // lastUpdated is Infinity if there's no cache at all
    const lastUpdated = asnlookup.lastUpdated();

    console.log(`Last updated ${lastUpdated} days ago.`);

    // update the cache if it's older than 31 days
    if (lastUpdated > 31) {
        console.log('Cache too old or never created. Updating...');
        await asnlookup.update();
    }

    testArray.forEach(function(ip) {
        console.log(ip, '-', asnlookup.lookup(ip));
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
