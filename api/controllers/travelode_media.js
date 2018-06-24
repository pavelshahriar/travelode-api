'use strict';

const util = require('util');

const db = require('../../db');
const privacy = require('../helpers/privacyTranslator');
const mediaUrlTransformer = require('../helpers/mediaUrlTransformer');
const formatResponseMessage = require('../helpers/formatResponseMessage');
const travelodeService = require('../services/travelodeService');
const mediaService = require('../services/mediaService');
const locationService = require('../services/locationService');
const travelodeMediaService = require('../services/travelodeMediaService');

module.exports = {
  findMediasByTravelode: findMediasByTravelode,
  addMediaToTravelode: addMediaToTravelode,
  findTravelodeByMedia: findTravelodeByMedia,
  addTravelodeForMedia: addTravelodeForMedia,
  findTravelodeMedias: findTravelodeMedias,
  addTravelodeMedia: addTravelodeMedia,
  getTravelodeMediaById: getTravelodeMediaById,
  updateTravelodeMediaById: updateTravelodeMediaById,
  deleteTravelodeMediaById: deleteTravelodeMediaById
};

const tableNameMedia = 'media';
const selectMediaItems = 'id, type, filename, userId, uploaded, updated, locationId, created, sizeX, sizeY, storage';

const tableNameTravelode = 'travelode';
const selectTravelodeItems = 'id, title, description, userId, created, updated, coverId';

const tableNameTravelodeMedia = 'travelode_media';
const selectTravelodeMediaItems = 'id, travelodeId, mediaId, rollNo, privacy, title, caption, displayDate, displayLocationId, created, isCover';

function findMediasByTravelode(req, res) {
  const id = req.swagger.params.id.value;
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;

  travelodeService.isTravelodeValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Travelode Not Found !');
      res.status(404).send(formatResponseMessage('Travelode not found'));
    } else {
      const query = db.query(
        'SELECT ' + selectMediaItems + ' FROM ' + tableNameMedia + ' WHERE id IN (' +
        'SELECT mediaId FROM ' + tableNameTravelodeMedia +
        ' WHERE travelodeId = ? ORDER BY displayDate ASC ) LIMIT ?, ? ',
        [id ,(page * size), parseInt(size)], function(err, result) {
        console.log(query.sql);
        if (!err) {
          console.log('Find Media by Travelode: ', result);
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
  });
}

function addMediaToTravelode(req, res) {
  const id = req.swagger.params.id.value;
  const mediaId = req.swagger.params.mediaId.value;

  privacy.getAllPrivacy();

  travelodeService.isTravelodeValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Travelode Not Found !');
      res.status(404).send(formatResponseMessage('Travelode not found'));
    } else {

      mediaService.isMediaValid(mediaId, function (err, found) {
        if (err) {
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        } else if (!found) {
          console.log('Media Not Found !');
          res.status(500).send(formatResponseMessage('Invalid Media Id'));
        } else {
          const caption = req.swagger.params.caption.value || '';
          const displayDate = req.swagger.params.displayDate.value;
          const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
          const storeDisplayDate = (typeof displayDate == 'undefined') ? currentDate :
            new Date(displayDate).toISOString().slice(0, 19).replace('T', ' ');

          const travelode_media_data = {
            "travelodeId": id,
            "mediaId": mediaId,
            "title" : req.swagger.params.title.value,
            "caption" : caption,
            "displayDate" : storeDisplayDate,
            "privacy" : privacy.privacyMatrix.findIndex(el => el === 'public'),
            "created" : currentDate
          };

          console.log(travelode_media_data);

          const query = db.query('INSERT INTO ' + tableNameTravelodeMedia + ' SET ?', travelode_media_data, function(err, result) {
            console.log(query.sql);
            if (!err) {
              console.log('Travelode Media Created: ', result);
              res.status(201).send(formatResponseMessage("Media added to the travelode", result.insertId));
            }
            else {
              console.error(err);
              res.status(500).send(formatResponseMessage(util.format('%s', err)));
            }
          });
        }
      });
    }
  });
}

function findTravelodeByMedia(req, res) {
  const id = req.swagger.params.id.value;
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;

  mediaService.isMediaValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Media Not Found !');
      res.status(404).send(formatResponseMessage('Media not found'));
    } else {
      const query = db.query(
        'SELECT ' + selectTravelodeItems + ' FROM ' + tableNameTravelode + ' WHERE id IN (' +
        'SELECT travelodeId FROM ' + tableNameTravelodeMedia +
        ' WHERE mediaId = ? ORDER BY displayDate ASC ) LIMIT ?, ? ',
        [id ,(page * size), parseInt(size)], function(err, result) {
        console.log(query.sql);
        if (!err) {
          console.log('Find Travelode by Media: ', result);
          res.send(result);
        }
        else {
          console.error(err);
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        }
      });
    }
  });
}

function addTravelodeForMedia(req, res) {
  const id = req.swagger.params.id.value;
  const travelodeId = req.swagger.params.travelodeId.value;

  privacy.getAllPrivacy();

  mediaService.isMediaValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Media Not Found !');
      res.status(404).send(formatResponseMessage('Media not found'));
    } else {

      travelodeService.isTravelodeValid(travelodeId, function (err, found) {
        if (err) {
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        } else if (!found) {
          console.log('Travelode Not Found !');
          res.status(500).send(formatResponseMessage('Invalid Travelode Id'));
        } else {
          const caption = req.swagger.params.caption.value || '';
          const displayDate = req.swagger.params.displayDate.value;
          const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
          const storeDisplayDate = (typeof displayDate == 'undefined') ? currentDate :
            new Date(displayDate).toISOString().slice(0, 19).replace('T', ' ');

          const travelode_media_data = {
            "mediaId": id,
            "travelodeId": travelodeId,
            "title" : req.swagger.params.title.value,
            "caption" : caption,
            "displayDate" : storeDisplayDate,
            "privacy" : privacy.privacyMatrix.findIndex(el => el === 'public'),
            "created" : currentDate
          };

          console.log(travelode_media_data);

          const query = db.query('INSERT INTO ' + tableNameTravelodeMedia + ' SET ?', travelode_media_data, function(err, result) {
            console.log(query.sql);
            if (!err) {
              console.log('Travelode Media Created: ', result);
              res.status(201).send(formatResponseMessage("Media added to the travelode", result.insertId));
            }
            else {
              console.error(err);
              res.status(500).send(formatResponseMessage(util.format('%s', err)));
            }
          });
        }
      });
    }
  });

}

function findTravelodeMedias(req, res) {
  const travelodeId = req.swagger.params.travelodeId.value;
  const mediaId = req.swagger.params.mediaId.value;
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const title = req.swagger.params.title.value || '';
  const displayDate = req.swagger.params.displayDate.value;
  const location = req.swagger.params.location.value;

  const queryPart1 = 'SELECT '+ selectTravelodeMediaItems + ' FROM ' + tableNameTravelodeMedia +
    ' WHERE title like "%'+ title +'%"';
  let queryPartConstructed = false;
  let queryPart2 = '';

  if (travelodeId || mediaId || displayDate) {

    if (travelodeId) {
      queryPartConstructed = true;
      queryPart2 += ' AND travelodeId = ' + travelodeId;
    }

    if (mediaId) {
      queryPartConstructed = true;
      queryPart2 += ' AND mediaId = ' + mediaId;
    }

    if (displayDate) {
      queryPartConstructed = true;
      queryPart2 += ' AND date(displayDate) = ' + displayDate;
    }
  }

  if (typeof location == 'undefined') {
    const query = queryPart1 + ((queryPartConstructed) ? queryPart2 : '')
      + ' LIMIT ' + (page * size) + ', ' + parseInt(size);
    findTravelodeMediasExecQuery(req, res, query);
  }
  else {
    locationService.isLocationValid(location, function (err, found) {
      if (err) {
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      } else if (!found) {
        console.log('Location Not Found !');
        res.status(500).send(formatResponseMessage('Invalid location Id'));
      } else {
        queryPart2 += ' AND displayLocationId = ' + location;
        const query = queryPart1 + queryPart2 + ' LIMIT ' + (page * size)
          + ', ' + parseInt(size);
        findTravelodeMediasExecQuery(req, res, query);
      }
    });
  }

  function findTravelodeMediasExecQuery(req, res, dbQuery) {
    const query = db.query(dbQuery, function(err, result) {
      console.log(query.sql);
      if (!err) {
        console.log('Find Travelode Media: ', result);
        res.send(result);
      }
      else {
        console.error(err);
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      }
    });
  }

}

function addTravelodeMedia(req, res) {
  const travelodeId = req.swagger.params.travelodeId.value;
  const mediaId = req.swagger.params.mediaId.value;
  const caption = req.swagger.params.caption.value || '';
  const displayDate = req.swagger.params.displayDate.value;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const storeDisplayDate = (typeof displayDate == 'undefined') ? currentDate :
    new Date(displayDate).toISOString().slice(0, 19).replace('T', ' ');

  const travelode_media_data = {
    "travelodeId": travelodeId,
    "mediaId": mediaId,
    "title" : req.swagger.params.title.value,
    "caption" : caption,
    "displayDate" : storeDisplayDate,
    "privacy" : privacy.privacyMatrix.findIndex(el => el === 'public'),
    "created" : currentDate
  };

  console.log(travelode_media_data);

  const query = db.query('INSERT INTO ' + tableNameTravelodeMedia + ' SET ?', travelode_media_data, function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Travelode Media Created: ', result);
      res.status(201).send(formatResponseMessage("Media added to the travelode", result.insertId));
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

function getTravelodeMediaById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectTravelodeMediaItems +' FROM ' + tableNameTravelodeMedia + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (result.length === 0) {
      console.error('No Media Found');
      res.status(404).send(formatResponseMessage('No Travelode Media Found'));
    }
    else {
      console.log('Get Travelode Media By Id : ', result);
      res.send(result);
    }
  });
}

function updateTravelodeMediaById(req, res) {
  const id = req.swagger.params.id.value;
  const travelode_media_data =  req.swagger.params.travelodeMediaData.value;

  travelode_media_data['isCover'] = travelode_media_data['isCover'] ? 1 : 0;
  travelode_media_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if(typeof travelode_media_data['displayDate'] != 'undefined') {
    travelode_media_data['displayDate'] = new Date(travelode_media_data['displayDate']).toISOString().slice(0, 19).replace('T', ' ');;
  }

  if(travelode_media_data['title'] === '') {
    res.status(400).send(formatResponseMessage('Title cannot to be blank'));
  } else if(travelode_media_data['rollNo'] < 1) {
    res.status(400).send(formatResponseMessage('Media roll no cannot be less than 1 in a travelode'));
  } else if(travelode_media_data['privacy'] < 1) {
    res.status(400).send(formatResponseMessage('Privacy value cannot be less than 0'));
  } else if(travelode_media_data['privacy'] > privacy.privacyMatrix.length) {
  res.status(400).send(formatResponseMessage('Invalid Privacy value'));
  } else if(travelode_media_data['displayLocationId'] < 1) {
    res.status(400).send(formatResponseMessage('Location Id cannot be less than 1'));
  } else {
    console.log(travelode_media_data);

    travelodeMediaService.isTravelodeMediaValid(id, function(err, found){
      if (err) {
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      } else if (!found) {
        console.log('Travelode Media Not Found !');
        res.status(404).send(formatResponseMessage('Travelode Media not found'));
      } else {

        locationService.isLocationValid(travelode_media_data['displayLocationId'], function (err, found) {
          if (err) {
            res.status(500).send(formatResponseMessage(util.format('%s', err)));
          } else if (!found) {
            console.log('Location Not Found !');
            res.status(400).send(formatResponseMessage('Invalid location Id'));
          } else {

            const query = db.query('UPDATE ' + tableNameTravelodeMedia + ' SET ? WHERE id = ?', [travelode_media_data, id], function(err, result) {
              console.log(query.sql);
              if (!err) {
                console.log('Update Travelode Media: ', result);
                res.send(formatResponseMessage('Travelode Media Updated'));
              }
              else {
                console.error(err);
                res.status(500).send(formatResponseMessage(util.format('%s', err)));
              }
            });
          }
       });
      }
    });
  }
}

function deleteTravelodeMediaById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameTravelodeMedia + ' WHERE id = ?', id, function(err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows === 0) {
      console.log('Delete Travelode Media: ', result);
      res.status(404).send(formatResponseMessage('Travelode Media Not Found'));
    }
    // Success
    else {
      console.log('Delete Travelode Media: ', result);
      res.status(204).send(formatResponseMessage('Travelode Media Entry Deleted'));
    }
  });
}
