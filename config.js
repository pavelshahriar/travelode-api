'use strict';

require('dotenv').config({path: '.env'});

const configs = {
  appRoot    : __dirname,
  env        : process.env['ENV'],
  host       : process.env['HOST'],
  port       : process.env['PORT'],
  db_host    : process.env['DB_HOST'],
  db_user    : process.env['DB_USER'],
  db_pass    : process.env['DB_PASS'],
  db_name    : process.env['DB_NAME'],
  db_port    : process.env['DB_PORT'],
  aws_access : process.env['AWS_ACCESS_KEY_ID'],
  aws_secret : process.env['AWS_SECRET_ACCESS_KEY'],
  aws_region : process.env['AWS_REGION'],
};

console.log('Configs :');
console.log('%o', configs);

module.exports = configs;
