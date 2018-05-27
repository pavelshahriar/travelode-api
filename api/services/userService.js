'use strict';

const db = require('../../db');

class userService {
  constructor(tableName, selectUserItems) {
    this.tableNameUser = tableName;
    this.selectUserItems = selectUserItems;
  }

  isUserValid(id, callback) {
    const query = db.query('SELECT '+ this.selectUserItems +' FROM ' + this.tableNameUser + ' WHERE id = ?',
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

module.exports = new userService('user', 'id, email, fullname, photo, created, updated');
