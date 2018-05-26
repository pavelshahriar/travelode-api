'use strict';

const config = require('./config');
const host = process.env.HOST;
const port = process.env.PORT || config.port; // Important for Heroku

const express = require('express');
const swaggerTools = require('swagger-tools');
const yaml = require('yamljs');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const s3 = require('./s3.js');
const bucketNameTransformer = require('./api/helpers/bucketNameTransformer');

// Init Server
const server = express();

// Static asset serving
// server.use(express.static('uploads'));
server.use('/cdn/user/media', express.static(path.join(__dirname, 'uploads')))

// Body Parser
server.use(bodyParser.json());

// Init Multer and upload file with name tripMedia
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})
const upload = multer({ storage: storage });
server.use(upload.fields([{name: "tripMedia"}]));

 // Init AWS S3
const bucketName = bucketNameTransformer();
console.log(bucketName);
s3.isBucketPresent(bucketName, function (err, foundBucket){
  if (err) {
    console.log(err);
  } else {
    if (typeof foundBucket == "undefined" ) {
      s3.createBucket(bucketName, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('New bucket created with name : ' + bucketName);
        }
      })
    } else {
      console.log("Bucket - " + bucketName + " is already present");
    }
  }
})

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
