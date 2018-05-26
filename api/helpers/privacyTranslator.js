'use strict';

const util = require('util');
const db = require('../../db');

const tableNamePrivacy = 'privacy';
const selectPrivacyItems = 'id, type';
//const privacyMatrix = {};

const privacyTranslator = {

  privacyMatrix: [],
  getAllPrivacy: function () {
    const query = db.query(
      'SELECT ' + selectPrivacyItems + ' FROM ' + tableNamePrivacy, function(err, result) {
      console.log(query.sql);
      if (!err) {
        //let privacyMatrix = [];
        result.forEach(el => {
          // since the index in mysql starts with 1, not 0
          privacyTranslator.privacyMatrix[el.id - 1] = el.type;
        })
        console.log('Privacy matrix loaded : ', privacyTranslator.privacyMatrix);
      }
      else {
        console.error(err);
      }
    });
  }
};

module.exports = privacyTranslator;
