'use strict';

const db = require('../../db');

class locationService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  isLocationValid(id, callback) {
    const query = db.query('SELECT '+ this.selectItems +' FROM ' + this.tableName + ' WHERE id = ?',
    [id],
    function(err, result) {
      console.log(query.sql);
      if (err) {
        console.error(err);
        callback(err, null);
      }

      let found = (result.length !== 0) ? true : false;
      callback(null, found);
    });
  }
}

module.exports = new locationService('location', 'id, name, magnitude, lattitude, city, country, continent');
