'use strict';

const express = require('express');
const swaggerTools = require('swagger-tools');
const yaml = require('yamljs');

const config = require('./config');

// Init Server
const server = express();
module.exports = server; // for testing

// Init Swagger UI
const swaggerDoc = yaml.load(config.appRoot + '/api/swagger/swagger.yaml');
swaggerDoc.host = config.hostUrl + ':' + config.port
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Serve the Swagger documents and Swagger UI
  server.use(middleware.swaggerUi());
});

// Init Swagger Express & Start App
const SwaggerExpress = require('swagger-express-mw');
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) {
    throw err;
  }

  // install middleware
  swaggerExpress.register(server);
  server.listen(config.port);
});

server.get('/', (req,res) => {
  res.send('Hello Traveler!')
});