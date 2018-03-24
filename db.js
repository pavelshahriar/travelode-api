'use strict';

var env = require('dotenv').config();
var mysql = require('mysql');
//var configPrefix = 'LOCAL_';
var configPrefix = 'AWS_';

var db = mysql.createConnection({
  host     : process.env[configPrefix + 'DB_HOST'],
  user     : process.env[configPrefix + 'DB_USER'],
  password : process.env[configPrefix + 'DB_PASS'],
  database : process.env[configPrefix + 'DB_NAME'],
  port     : process.env[configPrefix + 'DB_POST']
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
