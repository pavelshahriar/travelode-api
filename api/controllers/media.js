'use strict';

const util = require('util');
const multer = require('multer');
const fs = require('fs');

const db = require('../../db');
const s3 = require('../../s3');
const config = require('../../config');
const mediaUrlTransformer = require('../helpers/mediaUrlTransformer');
const bucketNameTransformer = require('../helpers/bucketNameTransformer');
const formatResponseMessage = require('../helpers/formatResponseMessage');
const userService = require('../services/userService');
const mediaService = require('../services/mediaService');
const locationService = require('../services/locationService');

module.exports = {
  findMedias: findMedias,
  createMedia: createMedia,
  getMediaById: getMediaById,
  updateMediaById: updateMediaById,
  deleteMediaById: deleteMediaById
};

const tableNameMedia = 'media';
const selectMediaItems = 'id, type, filename, userId, uploaded, updated, locationId, created, sizeX, sizeY, storage';
const bucketName = bucketNameTransformer();

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
        el['url'] = mediaUrlTransformer.mediaBasePathUrl[el.storage] + el.filename;
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
  const clouded =  true; //req.swagger.params.clouded.value;

  // 0. The image is already saved in the server coming here because of multer middleware
  console.log(tripMedia);

  // 1. Check if the user id provided is valid or not. If not, remove the file from server
  userService.isUserValid(userId, function (err, found) {
    if (err) {
      console.error(err); // error in getting the user
      removeMediaFromServer(tripMedia.filename, function (removed) {
        if (!removed) {
          console.error('The file : ' + tripMedia.filename + ' was not removed.');
        }
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      });
    } else if (!found){
      console.log('User Not Found !');
      removeMediaFromServer(tripMedia.filename, function (removed) {
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
        storage: (clouded) ? 's3' : 'disk'
      };
      const query = db.query('INSERT INTO ' + tableNameMedia + ' SET ?', media_data, function(err, result) {
        console.log(query.sql);
        if (!err) {
          console.log('Media Created: ', result.insertId);

          if (!clouded) {
            res.status(201).send(formatResponseMessage("Media Created", result.insertId));
          } else {

            // 3. Upload the image to s3 bucket
            s3.uploadImage(bucketName, tripMedia.filename, tripMedia.path, function(err) {
              if (err) {
                console.error(err);
                res.status(500).send(util.format('%s', err));
              } else {
                console.log("Successfully uploaded image - " + tripMedia.filename +" to the bucket - " + bucketName);

                // 4. Remove the file from server
                removeMediaFromServer(tripMedia.filename, function (removed) {
                  if (!removed) {
                    console.error('The file : ' + tripMedia.filename + ' was not removed.');
                  }
                  console.log(tripMedia.filename + ' is deleted from the server');
                  res.status(201).send(formatResponseMessage("Media Created and Uploaded to Cloud", result.insertId));
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
}

function getMediaById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectMediaItems +' FROM ' + tableNameMedia + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (result.length === 0) {
      console.error('No Media Found');
      res.status(404).send(formatResponseMessage('No Media Found'));
    }
    else {
      console.log('Get Media By Id : ', result);
      result.forEach(el => {
        el['url'] = mediaUrlTransformer.mediaBasePathUrl[el.storage] + el.filename;
        delete el.filename;
        delete el.storage;
      });
      res.send(result);
    }
  });
}

function updateMediaById(req, res) {
  const id = req.swagger.params.id.value;
  const media_data =  req.swagger.params.mediaData.value;
  media_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  mediaService.isMediaValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (!found){
      console.log('Media Not Found !');
      res.status(404).send(formatResponseMessage('Media not found'));
    }
    else {

      // very very bad approach. we should think about using rxjs in later iteration
      // if user id passed.. check if its valid or not
      if(media_data.userId){
        userService.isUserValid(media_data.userId, function (err, found) {
          if (err) {
            console.log(err);
            res.status(500).send(formatResponseMessage(util.format('%s', err)));
          }
          else if (!found) {
            console.log('Invalid User Id');
            res.status(400).send(formatResponseMessage('Invalid User Id'));
          }
          else {
            // if location if passed.. check if its valud or not
            if(media_data.locationId){
              locationService.isLocationValid(media_data.locationId, function (err, found) {
                if (err) {
                  console.log(err);
                  res.status(500).send();
                }
                else if (!found) {
                  console.log('Invalid Localtion Id');
                  res.status(400).send(formatResponseMessage('Invalid Location Id'));
                }
                else {
                  const query = db.query('UPDATE ' + tableNameMedia + ' SET ? WHERE id = ?', [media_data, id], function(err, result) {
                    console.log(query.sql);
                    if (!err) {
                      console.log('Update Media: ', result);
                      res.send(formatResponseMessage('Media Updated'));
                    }
                    else {
                      console.error(err);
                      res.status(500).send(formatResponseMessage(util.format('%s', err)));
                    }
                  });
                }
              });
            }
            // if no location id passed
            else {
              const query = db.query('UPDATE ' + tableNameMedia + ' SET ? WHERE id = ?', [media_data, id], function(err, result) {
                console.log(query.sql);
                if (!err) {
                  console.log('Update Media: ', result);
                  res.send(formatResponseMessage('Media Updated'));
                }
                else {
                  console.error(err);
                  res.status(500).send(formatResponseMessage(util.format('%s', err)));
                }
              });
            }
          }
        });
      }
      // if no user id passed..
      else {
        if(media_data.locationId){
          locationService.isLocationValid(media_data.locationId, function (err, found) {
            if (err) {
              console.log(err);
              res.status(500).send();
            }
            else if (!found) {
              console.log('Invalid Localtion Id');
              res.status(400).send(formatResponseMessage('Invalid Location Id'));
            }
            else {
              const query = db.query('UPDATE ' + tableNameMedia + ' SET ? WHERE id = ?', [media_data, id], function(err, result) {
                console.log(query.sql);
                if (!err) {
                  console.log('Update Media: ', result);
                  res.send(formatResponseMessage('Media Updated'));
                }
                else {
                  console.error(err);
                  res.status(500).send(formatResponseMessage(util.format('%s', err)));
                }
              });
            }
          });
        }
        else {
          const query = db.query('UPDATE ' + tableNameMedia + ' SET ? WHERE id = ?', [media_data, id], function(err, result) {
            console.log(query.sql);
            if (!err) {
              console.log('Update Media: ', result);
              res.send(formatResponseMessage('Media Updated'));
            }
            else {
              console.error(err);
              res.status(500).send(formatResponseMessage(util.format('%s', err)));
            }
          });
        }
      }
      // userService.isUserValid(media_data.userId, function (err, found) {
      //   if (err) {
      //     console.log(err);
      //     res.status(500).send(formatResponseMessage(util.format('%s', err)));
      //   } else if (!found) {
      //     console.log('Invalid User Id');
      //     res.status(400).send(formatResponseMessage('Invalid User Id'));
      //   } else {
      //
      //     locationService.isLocationValid(media_data.locationId, function (err, found) {
      //       if (err) {
      //         console.log(err);
      //         res.status(500).send();
      //       } else if (!found) {
      //         console.log('Invalid Localtion Id');
      //         res.status(400).send(formatResponseMessage('Invalid Location Id'));
      //       } else {
      //
      //         const query = db.query('UPDATE ' + tableNameMedia + ' SET ? WHERE id = ?', [media_data, id], function(err, result) {
      //           console.log(query.sql);
      //           if (!err) {
      //             console.log('Update Media: ', result);
      //             res.send(formatResponseMessage('Media Updated'));
      //           }
      //           else {
      //             console.error(err);
      //             res.status(500).send(formatResponseMessage(util.format('%s', err)));
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
    }
  });
}

function deleteMediaById(req, res) {
  const id = req.swagger.params.id.value;

  mediaService.getOneMediaById(id, function (err, media) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (typeof media == 'undefined'){
      console.log('Media Not Found !');
      res.status(404).send(formatResponseMessage('Media not found'));
    } else {
      const currentMedia = media;
      const query = db.query('DELETE FROM ' + tableNameMedia + ' WHERE id = ?', id, function(err, result) {
        console.log(query.sql);
        // Check for errors
        if (err) {
          console.error(err);
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        }
        // Send 404 if the resource is not found
        else if (result.affectedRows === 0) {
          console.log('Delete Media: ', result);
          res.status(404).send(formatResponseMessage('Media Not Found'));
        }
        // Success
        else {
          console.log('Delete Media: ', result);
          const currentMediaStorage = currentMedia.storage;

          if (currentMediaStorage === 'disk') {
            removeMediaFromServer(currentMedia.filename, function (removed) {
              if (!removed) {
                console.error('The file : ' + currentMedia.filename + ' was not removed.');
              } else {
                console.error('The file : ' + currentMedia.filename + ' was remove from ' + currentMediaStorage);
                res.status(204).send(formatResponseMessage('Media Deleted and removed from ' + currentMediaStorage));
              }
            });
          } else if (currentMediaStorage === 's3') {
            s3.deleteImage(bucketName, currentMedia.filename, function(err) {
              if (err) {
                console.error(err);
                res.status(500).send(util.format('%s', err));
              } else {
                console.error('The file : ' + currentMedia.filename + ' was remove from ' + currentMediaStorage);
                res.status(204).send(formatResponseMessage('Media Deleted and remove from ' + currentMediaStorage));
              }
            })
          } else {
            res.status(204);
          }
        }
      });
    }
  });
}

function getMediaType(mimetype) {
  let mediaType;
  switch (mimetype) {
    case 'image/jpeg':
      mediaType = 1;
      break;
    case 'image/png':
      mediaType = 1;
      break;
    default:
      mediaType = 0;
  }
  return mediaType;
}

function removeMediaFromServer(file, callback) {
  fs.unlink('uploads/' + file, function(error) {
    if (error) {
      console.error(err);
      callback(false);
    } else {
      console.log(file + ' is deleted from the server');
      callback(true);
    }
  });
}
