'use strict';

const fs = require('fs');
const test = require('tape');
const {reRequire} = require('mock-require');
const tryToCatch = require('try-to-catch');

const noop = () => {};

test('readdir: empty dir', async (t) => {
    const readdirFS = fs.readdir;
    
    fs.readdir = (dir, cb) => {
        cb(null, []);
    };
    
    const readdir = reRequire('../lib/readdir');
    
    const [, result] = await tryToCatch(readdir, '.');
    
    fs.readdir = readdirFS;
    
    t.deepEqual(result, [], 'should return empty array');
    t.end();
});

test('readdir: result', async (t) => {
    const {
        readdir:readdirFS,
        stat,
    } = fs;
    
    const name = 'hello.txt';
    const mode = 16893;
    const size = 1024;
    const mtime = new Date();
    const uid = 1000;
    
    fs.readdir = (dir, fn) => {
        fn(null, [name]);
    };
    
    fs.stat = (name, fn) => {
        fn(null, {
            isDirectory: noop,
            name,
            mode,
            size,
            mtime,
            uid
        });
    };
    
    const expected = [{
        name,
        size,
        date: mtime,
        owner: uid,
        mode
    }];
    
    const readdir = reRequire('../lib/readdir');
    const [, result] = await tryToCatch(readdir, '.');
    
    fs.readdir = readdirFS;
    fs.stat = stat;
    
    t.deepEqual(expected, result, 'should get raw values');
    t.end();
});

