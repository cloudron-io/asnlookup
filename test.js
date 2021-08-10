'use strict';

/* global it:false */
/* global describe:false */
/* global before:false */
/* global after:false */

const expect = require('expect.js'),
    fs = require('fs'),
    path = require('path');

const TEST_CACHE_FILE = '.asnlookup.tests.cache';

function cleanup() {
    try {
        fs.unlinkSync(path.resolve(TEST_CACHE_FILE));
    } catch (e) {}
}

describe('asnlookup', function () {
    this.timeout(10000);

    before(cleanup);
    after(cleanup);

    it('last updated is Infinity without cache', function () {
        const asnlookup = require('./index.js')(TEST_CACHE_FILE);

        const lastUpdated = asnlookup.lastUpdated();

        expect(lastUpdated).to.equal(Infinity);
    });

    it('can update cache initially', async function () {
        this.timeout(0);

        const asnlookup = require('./index.js')(TEST_CACHE_FILE);

        console.log('Updating cache, this takes some time...');
        await asnlookup.update();

        const lastUpdated = asnlookup.lastUpdated();

        expect(lastUpdated).to.equal(0);
    });

    it('can load from cache', async function () {
        const asnlookup = require('./index.js')(TEST_CACHE_FILE);

        await asnlookup.load();

        const lastUpdated = asnlookup.lastUpdated();

        expect(lastUpdated).to.equal(0);
    });

    it('lookup succeeds for 8.8.8.8', async function () {
        const asnlookup = require('./index.js')(TEST_CACHE_FILE);
        await asnlookup.load();

        expect(asnlookup.lookup('8.8.8.8')).to.equal('GOOGLE');
    });

    it('lookup succeeds with null for 127.0.0.1', async function () {
        const asnlookup = require('./index.js')(TEST_CACHE_FILE);
        await asnlookup.load();

        expect(asnlookup.lookup('127.0.0.1')).to.eql(null);
    });
});
