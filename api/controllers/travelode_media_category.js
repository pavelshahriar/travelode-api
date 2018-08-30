'use strict';

const util = require('util');
const db = require('../../db');
const privacy = require('../helpers/privacyTranslator');
const formatResponseMessage = require('../helpers/formatResponseMessage');
const travelodeService = require('../services/travelodeService');
const mediaService = require('../services/mediaService');
const travelodeMediaCategoryService = require('../services/travelodeMediaCategoryService');
const categoryService = require('../services/categoryService');

privacy.getAllPrivacy();

module.exports = {
  findTravelodeMediaCategory: findTravelodeMediaCategory,
  addTravelodeMediaCategory: addTravelodeMediaCategory,

  getTravelodeMediaCategoryById: getTravelodeMediaCategoryById,
  updateTravelodeMediaCategoryById: updateTravelodeMediaCategoryById,
  deleteTravelodeMediaCategoryById: deleteTravelodeMediaCategoryById
}

const tableNameTravelodeMediaCategory = 'travelode_media_category';
const selectTravelodeMediaCategoryItems = 'id, travelodeId, mediaId, categoryId';

// GET /travelode/media/category
function findTravelodeMediaCategory(req, res) {
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const categoryId = req.swagger.params.categoryId.value;
  const travelodeId = req.swagger.params.travelodeId.value;
  const mediaId = req.swagger.params.mediaId.value;

  const queryPart1 = 'SELECT ' + selectTravelodeMediaCategoryItems + ' FROM ' + tableNameTravelodeMediaCategory;
  let queryPartConstructed = false;
  let queryPart2 = '';

  if (categoryId || travelodeId || mediaId) {
    // if categoryId param is given
    if (categoryId) {
      queryPartConstructed = true;
      queryPart2 += 'categoryId = ' + categoryId
    }

    if (travelodeId) {
      if (queryPartConstructed) { queryPart2 += ' AND '; }
      else { queryPartConstructed = true; }
      queryPart2 += 'travelodeId = ' + travelodeId
    }

    if (mediaId) {
      if (queryPartConstructed) { queryPart2 += ' AND '; }
      else { queryPartConstructed = true; }
      queryPart2 += 'mediaId = ' + mediaId
    }
  }

  const query = db.query(queryPart1 + ((queryPartConstructed) ? ' WHERE ' + queryPart2 : '')
    + ' LIMIT ?, ?', [(page * size), parseInt(size)], function (err, result) {
      console.log(query.sql);

      if (!err) {
        console.log('Find Media by Travelode-media-category: ', result);
        res.status(200).send(result);
      }
      else {
        console.error(err);
        res.status(500).send(formatResponseMessage(util.format('%s', err)));
      }
    });

}

// POST /travelode/media/category
function addTravelodeMediaCategory(req, res) {
  const travelodeId = req.swagger.params.travelodeId.value;
  travelodeService.isTravelodeValid(travelodeId, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Travelode Not Found!');
      res.status(404).send(formatResponseMessage('Travelode not found'));
    } else {

      const mediaId = req.swagger.params.mediaId.value;
      mediaService.isMediaValid(mediaId, function (err, found) {
        if (err) {
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        } else if (!found) {
          console.log('Media Not Found !');
          res.status(404).send(formatResponseMessage('Invalid Media Id'));
        } else {
          // FIXME Get categories as array not a singular input, check travelode_media.js:337
          const categoryId = req.swagger.params.categoryId.value;
          categoryService.isCategoryValid(categoryId, function (err, found) {
            if (err) {
              res.status(500).send(formatResponseMessage(util.format('%s', err)));
            } else if (!found) {
              console.log('Category Not Found !');
              res.status(404).send(formatResponseMessage('Invalid Category Id'));
            } else {

              const media_category_data = {
                "travelodeId": travelodeId,
                "mediaId": mediaId,
                "categoryId": categoryId
              };

              console.log(media_category_data);

              const query = db.query('INSERT INTO ' + tableNameTravelodeMediaCategory + ' SET ?', media_category_data, function (err, result) {
                console.log(query.sql);
                if (!err) {
                  console.log('Travelode-media-category added: ', result);
                  res.status(201).send(formatResponseMessage("Travelode-media-category Added", result.insertId));
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
  });
}

// GET /travelode/media/category/{id}
function getTravelodeMediaCategoryById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT ' + selectTravelodeMediaCategoryItems + ' FROM ' + tableNameTravelodeMediaCategory + ' WHERE id = ? LIMIT 0, 1', id, function (err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (result.length === 0) { // result.affectedRow doesn't return 404, fix it for all
      console.error('No Travelode-media-category Found');
      res.status(404).send(formatResponseMessage('No Travelode-media-category Found'));
    }
    else {
      console.log('Get Travelode-media-category By Id : ', result);
      res.send(result);
    }
  });
}

// PUT /travelode/media/category/{id}
function updateTravelodeMediaCategoryById(req, res) {
  const id = req.swagger.params.id.value;
  const travelodeMediaCategoryData = req.swagger.params.travelodeMediaCategoryData.value;
  console.log(travelodeMediaCategoryData);

  /*const categoryId = req.swagger.params.categoryId.value;
    const travelodeId = req.swagger.params.travelodeId.value;
    const mediaId = req.swagger.params.mediaId.value; */

  /*   const travelode_media_category_data = {}
  
    if(categoryId || travelodeId || mediaId ) {
      if (categoryId) {
        Object.assign(travelode_media_category_data, {"categoryId": categoryId });
      }
      if (travelodeId) {
        Object.assign(travelode_media_category_data, {"travelodeId": travelodeId });
      }
      if (mediaId) {
        Object.assign(travelode_media_category_data, {"mediaId": mediaId });
      }
    }
  
    console.log(travelode_media_category_data); */

  // TODO Add async callback

  const query = db.query('UPDATE ' + tableNameTravelodeMediaCategory + ' SET ? WHERE id = ?', [travelodeMediaCategoryData, id], function (err, result) {
    console.log(query.sql);
    console.log(result);

    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));

    }
    else if (result.affectedRows == 0) {
      res.status(404).send(formatResponseMessage('No Travelode-media-category Found'));
    }

    else {
      console.log('Travelode media category updated: ', result);
      res.status(200).send(formatResponseMessage('Travelode media category updated'));
    }
  });

}

// DELETE /travelode/mediia/category/{id}
function deleteTravelodeMediaCategoryById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameTravelodeMediaCategory + ' WHERE id = ?', id, function (err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows == 0) {  // '===' wasn't returning 204 after deletion, maybe type is different?
      res.status(404).send(formatResponseMessage('Travelode-media-category Not Found'));
      console.log('Delete Travelode-media-category: ', result);
    }
    // Success
    else {
      console.log('Delete Travelode-media-category: ', result);
      res.status(204).send(formatResponseMessage('Travelode-media-category Deleted'));
    }
  });
}