'use strict';

require('dotenv').config();

// @Todo: Automate this
// const env = 'local';
const env = 'aws';

const env_prefix = env.toUpperCase() + '_';

const configs = {
  appRoot : __dirname,
  hostUrl : process.env[env_prefix + 'HOST'],
  port    : process.env[env_prefix + 'PORT'],
  db_host : process.env[env_prefix + 'DB_HOST'],
  db_user : process.env[env_prefix + 'DB_USER'],
  db_pass : process.env[env_prefix + 'DB_PASS'],
  db_name : process.env[env_prefix + 'DB_NAME'],
  db_port : process.env[env_prefix + 'DB_PORT']
};

console.log('Configs :');
console.log('%o', configs);

module.exports = configs;