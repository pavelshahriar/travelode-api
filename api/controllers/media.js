'use strict';

const util = require('util');
const multer = require('multer');
const fs = require('fs');

const db = require('../../db');
const s3 = require('../../s3');
const config = require('../../config');
const userService = require('../services/userService');

module.exports = {
  findMedias: findMedias,
  createMedia: createMedia
};

const tableNameMedia = 'media';
const selectMediaItems = 'id, type, filename, userId, uploaded, updated, locationId, created, sizeX, sizeY, storage';
const bucketName = config.s3_bucket + '.' + config.env;

function findMedias(req, res) {
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const type = req.swagger.params.type.value;
  const userId = req.swagger.params.userId.value;
  const locationId = req.swagger.params.locationId.value;

  const queryPart1 = 'SELECT '+ selectMediaItems + ' FROM ' + tableNameMedia;
  let queryPartConstructed = false;
  let queryPart2 = '';

  if (type > 0 || userId || locationId) {
    if (type > 0) {
      queryPartConstructed = true;
      queryPart2 += 'type = ' + type
    };
    if (userId) {
      if (queryPartConstructed) { queryPart2 += ' AND ';}
      else { queryPartConstructed = true;}
      queryPart2 += 'userId = ' + userId;
    }
    if (locationId) {
      if (queryPartConstructed) { queryPart2 += ' AND ';}
      else {queryPartConstructed = true;}
      queryPart2 += 'locationId = ' + locationId
    }
  }

  const query = db.query( queryPart1 + ((queryPartConstructed) ? ' WHERE ' + queryPart2 : '')
    + ' LIMIT ?, ?',[(page * size), parseInt(size)], function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Find Media: ', result);
      result.forEach(el => {
        el['url'] = getMediaUrl(el.filename, el.storage);
        delete el.filename;
        delete el.storage;
      });
      res.send(result);
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

function createMedia(req, res) {
  const userId = req.swagger.params.userId.value;
  const tripMedia = req.swagger.params.tripMedia.value;
  const clouded =  req.swagger.params.clouded.value;

  // 0. The image is already saved in the server coming here because of multer middleware
  console.log(tripMedia);

  // 1. Check if the user id provided is valid or not. If not, remove the file from server
  userService.isUserValid(userId, function (err, found) {
    if (err) {
      console.error(err); // error in getting the user
      removeMediaFromServer(tripMedia, function (removed) {
        if (!removed) {
          console.error('The file : ' + tripMedia.filename + ' was not removed.');
        }
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      });
    } else if (!found){
      console.log('User Not Found !');
      removeMediaFromServer(tripMedia, function (removed) {
        if (!removed) {
          console.error('The file : ' + tripMedia.filename + ' was not removed.');
        }
        res.status(404).send(formatResponseMessage('User not found'));
      });
    } else {
      const media_data = {
        type: getMediaType(tripMedia.mimetype),
        filename: tripMedia.filename,
        userId: userId,
        uploaded: new Date().toISOString().slice(0, 19).replace('T', ' '),
        locationId: 1,
        created: new Date().toISOString().slice(0, 19).replace('T', ' '),
        sizeX: 0,
        sizeY: 0,
        storage: 'disk'
      };
      const query = db.query('INSERT INTO ' + tableNameMedia + ' SET ?', media_data, function(err, result) {
        console.log(query.sql);
        if (!err) {
          console.log('Media Created: ', result);

          if (clouded === false) {
            res.send(formatResponseMessage("Media Created"));
          } else {

            // 3. Upload the image to s3 bucket if its
            s3.uploadImage(bucketName, tripMedia.filename, tripMedia.path, function(err) {
              if (err) {
                console.error(err);
                res.status(500).send(util.format('%s', err));
              } else {
                console.log("Successfully uploaded image - " + tripMedia.filename +" to the bucket - " + bucketName);

                // 4. Remove the file from server
                fs.unlink(tripMedia.path, function(error) {
                  if (error) {
                    console.error(err);
                    res.status(500).send(formatResponseMessage(util.format('%s', err)));
                  } else {
                      console.log(tripMedia.filename + ' is deleted from the server');
                      res.send(formatResponseMessage("Media Created and Uploaded to Cloud"));
                  }
                });
              }
            });
          }
        }
        else {
          console.error(err);
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        }
      });
    }
  });

  // 2. Database operations
  // res.send();
}

function getMediaType(mimetype) {
  let mediaType;
  switch (mimetype) {
    case 'image/jpeg':
      mediaType = 1;
      break;
    default:
      mediaType = 0;
  }
  return mediaType;
}

function removeMediaFromServer(tripMedia, callback) {
  fs.unlink(tripMedia.path, function(error) {
    if (error) {
      console.error(err);
      callback(false);
    } else {
        console.log(tripMedia.filename + ' is deleted from the server');
        callback(true);
    }
  });
}

function getMediaUrl(filename, storage) {
  let url = '';
  switch (storage) {
    case 's3':
      url = 'https://s3.amazonaws.com/' + bucketName +'/' + filename;
      break;
    default:
      url = 'http://localhost:28252/uploads/' + filename;
  }
  return url;
}

function formatResponseMessage(message) {
  return {
    "message": message
  }
}
