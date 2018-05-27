'use strict';

const util = require('util');
const db = require('../../db');
const privacyService = require('../services/privacyService');

const privacyTranslator = {

  privacyMatrix: [],
  getAllPrivacy: function () {
    privacyService.getAllPrivacy(function (err, privacies){
      if (err) {
        console.log(err);
      }
      else {
        privacies.forEach(el => {
          // since the index in mysql starts with 1, not 0
          privacyTranslator.privacyMatrix[el.id - 1] = el.type;
        })
        console.log('Privacy matrix loaded : ', privacyTranslator.privacyMatrix);
      }
    });
  }
};

module.exports = privacyTranslator;
