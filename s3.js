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
  isBucketPresent(bucketName, callback) {
    S3.listBuckets({}, function(err, data){
      if (err) {
        // console.log(err);
        callback(err, null);
      } else {
        const foundBucket = data.Buckets.find(el => {
           return (el.Name === bucketName);
        });
        callback(null, foundBucket);
      }
    });
  }

  createBucket(bucketName, callback) {
    S3.createBucket({Bucket: bucketName}, function(err, data) {
      if (err) {
        // console.log(err);
        callback(err);
      } else {
        // console.log("Successfully creted bucket : " + bucketName);
        callback();
      }
    });
  }

  uploadImage(bucketName, fileName, filePath, callback) {
    fs.readFile(filePath, function(err, fileBuffer){
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ACL: 'public-read'
      };
      S3.putObject(params, function(err, data) {
        if (err) {
          // console.log(err)
          callback(err);
        } else {
          // console.log("Successfully uploaded image - " + fileName +" to the bucket - " + bucketName);
          callback();
        }
      });
    });
  }

  retrieveImage(bucketName, fileName, callback) {
    const params = {Bucket: bucketName, Key: fileName};
    S3.getSignedUrl('getObject', params, function(err, url){
      if (err) {
        callback(err)
        // console.log(err);
      } else {
        // console.log('The url of the image is : ', url);
        callback();
      }
    })
  }

  deleteImage(bucketName, fileName, callback) {
    const params = {Bucket: bucketName, Key: fileName};
    S3.deleteObject(params, function(err, url) {
      if (err) {
        callback(err)
      } else {
        callback();
      }
    });
  }
}

module.exports = new s3Opt();
