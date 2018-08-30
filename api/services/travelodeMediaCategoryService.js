'use strict';

const db = require('../../db');

class travelodeMediaCategoryService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  travelodeMediaHasCategories(travelodeId, mediaId, callback) {
    const query = db.query('SELECT '+ this.selectItems +' FROM ' + this.tableName + ' WHERE travelodeId = ? AND mediaId = ?',
    [travelodeId, mediaId],
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

module.exports = new travelodeMediaCategoryService('travelode_media_category', 'id, travelodeId, mediaId, categoryId');
