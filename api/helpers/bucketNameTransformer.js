'use strict';

const config = require('../../config');

function bucketNameTransformer() {
  return config.s3_bucket + '.' + config.env;
}

module.exports = bucketNameTransformer;
