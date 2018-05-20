'use strict';

const fs = require('fs');
const AWS = require('aws-sdk');
const awsConfig = require('aws-config');
const config = require('./config');

const S3 = new AWS.S3(awsConfig({
  accessKeyId: config.aws_access,
  secretAccessKey: config.aws_secret,
  region: config.aws_region
}));

class s3Opt {
  isBucketPresent(bucketName) {
    S3.listBuckets({}, function(err, data){
      if (err) {
        console.log(err);
      } else {
        const foundBucket = data.Buckets.find(el => {
           return (el.Name === bucketName);
        });
        if (foundBucket) {
          console.log("Bucket - " + bucketName + " is already present");
        } else {
          console.log("Bucket does not exist. Go ahead and create it");
        }
      }
    });
  }

  createBucket(bucketName) {
    S3.createBucket({Bucket: bucketName}, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully creted bucket : " + bucketName);
      }
    });
  }

  uploadImage(bucketName, fileName, filePath) {
    fs.readFile(filePath, function(err, fileBuffer){
      const params = {Bucket: bucketName, Key: fileName, Body: fileBuffer};
      S3.putObject(params, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully uploaded image - " + fileName +" to the bucket - " + bucketName);
        }
      });
    });
  }

  retrieveImage(bucketName, fileName) {
    const params = {Bucket: bucketName, Key: fileName};
    S3.getSignedUrl('getObject', params, function(err, url){
      if (err) {
        console.log(err);
      } else {
        console.log('The url of the image is : ', url);
      }
    })
  }
}

module.exports = new s3Opt();

// isBucketPresent(bucketName);
// createBucket(bucketName);
// uploadImage(bucketName, 'my-travelode-photo.jpg', 'uploads/blankwhite.jpg');
// retrieveImage(bucketName, 'my-travelode-photo.jpg')
