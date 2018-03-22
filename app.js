'use strict';

var express = require('express');
var app = express();
var db = require('./db');
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

var swaggerTools = require('swagger-tools');
var YAML = require('yamljs');
var swaggerDoc = YAML.load(config.appRoot + '/api/swagger/swagger.yaml');

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());
});

var SwaggerExpress = require('swagger-express-mw');
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/user']) {
    console.log('try this in a browser:\nhttp://127.0.0.1:' + port + '/docs');
  }
});
