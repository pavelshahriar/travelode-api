'use strict';

const newman = require('newman');
const fs = require('fs');
const config = require('./config');

const path = './test/newman';

// FOR ALL
fs.readdir(path + '/collections', function (err, files) {
    if (err) { throw err; }

    // iterate on each file name and call newman.run using each file name
    files.forEach(function (file) {
        newman.run({
            collection: require(path + '/collections/' + file),
            environment: require(path + '/env/' + config.newman_env + '.json')
        }, function (err) {
            console.info(`${file}: ${err ? err.name : 'ok'}!`);
        });
    });
});

// FOR SINGLE
// newman.run({
//     collection: require(path + 'collections/4_travelode_media.json'),
//     environment: require(path + 'env/local.json'),
//     reporters: 'cli'
// }, function (err) {
// 	if (err) { throw err; }
//     console.log('collection run complete!');
// });
