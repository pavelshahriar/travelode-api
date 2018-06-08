'use strict';

const db = require('../../db');

class travelodeMediaService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  isTravelodeMediaValid(id, callback) {
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

module.exports = new travelodeMediaService('travelode_media', 'id, travelodeId, mediaId, rollNo, privacy, title, caption, displayDate, displayLocationId, isCover, created, updated');
