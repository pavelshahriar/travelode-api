'use strict';

const config = require('../../config');
const bucketNameTransformer = require('./bucketNameTransformer');

const mediaUrlTransformer = {

  mediaBasePathUrl : {
    's3' : 'https://s3.amazonaws.com/' + bucketNameTransformer() + '/',
    'disk' : config.host + ':' + config.port + '/cdn/user/media/'
  }
}

module.exports = mediaUrlTransformer;
