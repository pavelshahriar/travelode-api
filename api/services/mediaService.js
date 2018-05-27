'use strict';

const db = require('../../db');

class mediaService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  isMediaValid(id, callback) {
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

module.exports = new mediaService('media', 'id, type, filename, userId, uploaded, updated, locationId, created, sizeX, sizeY, storage');
