'use strict';

const mysql = require('mysql');

const config = require('./config');

const db = mysql.createConnection({
  host     : config.db_host,
  user     : config.db_user,
  password : config.db_pass,
  database : config.db_name,
  port     : config.db_port
});

db.connect(function(err){
  if(!err) {
    console.log("Database is connected ... nn");
  } else {
    console.log(err);
    console.log("Error connecting database ... nn");
  }
});

module.exports = db;
