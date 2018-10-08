'use strict';

const env = process.ENV
const config = require('../../config');

function bucketNameTransformer() {
  return (env !== 'prod') ? config.s3_bucket + '.' + env : config.s3_bucket;
}

module.exports = bucketNameTransformer;
