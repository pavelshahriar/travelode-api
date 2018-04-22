'use strict';

const config = require('./config');
const host = process.env.HOST;
const port = process.env.PORT || config.port; // Important for Heroku

const express = require('express');
const swaggerTools = require('swagger-tools');
const yaml = require('yamljs');

// Init Server
const server = express();
module.exports = server; // for testing

// Init Swagger UI
const swaggerDoc = yaml.load(config.appRoot + '/api/swagger/swagger.yaml');
swaggerDoc.host = (host !== 'localhost') ? host : host + ':' + port;
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
  server.listen(port);
});

server.get('/', function (req,res) {
  res.redirect('http://' + swaggerDoc.host + '/docs');
});
