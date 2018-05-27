'use strict';

const db = require('../../db');

class privacyService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  getAllPrivacy(callback) {
    const query = db.query('SELECT '+ this.selectItems +' FROM ' + this.tableName ,function(err, result) {
      console.log(query.sql);
      if (err) {
        console.error(err);
        callback(err, null);
      }

      callback(null, result);
    });
  }
}

module.exports = new privacyService('privacy', 'id, type');
