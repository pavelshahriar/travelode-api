'use strict';

const db = require('../../db');

class categoryService {
  constructor(tableName, selectItems) {
    this.tableName = tableName;
    this.selectItems = selectItems;
  }

  getAllCategories(callback) {
    const query = db.query('SELECT '+ this.selectItems +' FROM ' + this.tableName ,function(err, result) {
      console.log(query.sql);
      if (err) {
        console.error(err);
        callback(err, null);
      }

      callback(null, result);
    });
  }

  getCategoryId(name, callback) {
    const query = db.query('SELECT '+ this.selectItems +' FROM ' + this.tableName + ' WHERE name = "' + name + '"', function(err, result) {
      console.log(query.sql);
      if (err) {
        console.error(err);
        callback(err, null);
      }

      console.log(result);
      callback(null, result[0].id);
    });
  }

  isCategoryValid(id, callback) {
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

module.exports = new categoryService('category', 'id, name');
