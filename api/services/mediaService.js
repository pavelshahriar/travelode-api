'use strict';

const db = require('../../db');

class mediaService {
  constructor(tableName, selectMediaItems) {
    this.tableNameMedia = tableName;
    this.selectMediaItems = selectMediaItems;
  }

  getMediaById(id, callback) {
    const query = db.query('SELECT '+ this.selectMediaItems +' FROM ' + this.tableNameMedia + ' WHERE id = ?',
    [id],
    function(err, result) {
      console.log(query.sql);
      if (err) {
        console.error(err);
        callback(err, null);
      }
      callback(null, result[0]);
    });
  }
}

module.exports = new mediaService('media', 'id, type, filename, userId, uploaded, updated, locationId, created, sizeX, sizeY, storage');
