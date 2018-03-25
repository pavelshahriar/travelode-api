'use strict';

require('dotenv').config({path: '.env'});

const configs = {
  appRoot : __dirname,
  host    : process.env['HOST'],
  port    : process.env['PORT'],
  db_host : process.env['DB_HOST'],
  db_user : process.env['DB_USER'],
  db_pass : process.env['DB_PASS'],
  db_name : process.env['DB_NAME'],
  db_port : process.env['DB_PORT']
};

if (process.env['NODE_ENV'] !== 'local') {
  configs['host'] = process.env.CUSTOMVAR_HOSTNAME;
}

console.log('Configs :');
console.log('%o', configs);

module.exports = configs;