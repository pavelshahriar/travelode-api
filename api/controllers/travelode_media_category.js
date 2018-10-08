'use strict';

const async = require('async');
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
      res.status(404).send(formatResponseMessage('Travelode not found: Invalid Travelode ID'));
    } else {

      const mediaId = req.swagger.params.mediaId.value;
      mediaService.isMediaValid(mediaId, function (err, found) {
        if (err) {
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        } else if (!found) {
          console.log('Media Not Found !');
          res.status(404).send(formatResponseMessage('Media not found: Invalid Media ID'));
        } else {
          const categoryId = req.swagger.params.categoryId.value;
          categoryService.isCategoryValid(categoryId, function (err, found) {
            if (err) {
              res.status(500).send(formatResponseMessage(util.format('%s', err)));
            } else if (!found) {
              console.log('Category Not Found !');
              res.status(404).send(formatResponseMessage('Category not found: Invalid Category ID'));
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

  const categoryId = travelodeMediaCategoryData['categoryId']
  const travelodeId = travelodeMediaCategoryData['travelodeId'];
  const mediaId = travelodeMediaCategoryData['mediaId'];

  travelodeMediaCategoryService.isTravelodeMediaCategoryValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      res.status(404).send(formatResponseMessage('TravelodeMediaCategory not found: Invalid TravelodeMediaCategory ID'));
      console.log('TravelodeMediaCategory Not Found');
    }
    else {
      const valuesToBeChecked = [];
      if (travelodeId !== undefined) valuesToBeChecked.push('travelode');
      if (mediaId !== undefined) valuesToBeChecked.push('media');
      if (categoryId !== undefined) valuesToBeChecked.push('category');

      let ind = -1;
      const timeId = setInterval(checkValidation, 1000)

      function checkValidation() {
        ind++
        const valueToBeChecked = valuesToBeChecked[ind];
        console.log('valueToBeChecked = ' + valueToBeChecked);
        if (valueToBeChecked != undefined) {
          switch (valuesToBeChecked) {
            case 'travelode': 
              checkTravelode(); 
              break;
            case 'media': 
              checkMedia();
              break;
            case 'category':
              checkCategory();
              break;
          }
        } else {
          updateStuff();
          clearInterval(timeId)
        }
      }

      function checkTravelode() {
        travelodeService.isTravelodeValid(travelodeId, function (err, found) {
          console.log('inside travelode found: '+found)
          if (err) {
            res.status(500).send(formatResponseMessage(util.format('%s', err)));
            clearInterval(timeId)
          } else if (!found) {
            console.log('Travelode Not Found!');
            res.status(404).send(formatResponseMessage('Travelode not found: Invalid Travelode ID'));
            clearInterval(timeId)
          }
        });
      }

      function checkMedia() {
        mediaService.isMediaValid(mediaId, function (err, found) {
          console.log('inside media found: '+found)
          if (err) {
            res.status(500).send(formatResponseMessage(util.format('%s', err)));
            clearInterval(timeId)
          } else if (!found) {
            console.log('Media Not Found !');
            res.status(404).send(formatResponseMessage('Media not found: Invalid Media ID'));
            clearInterval(timeId)
          }
        });
      }

      function checkCategory() {
        categoryService.isCategoryValid(categoryId, function (err, found) {
          console.log('inside category found: '+found)
          if (err) {
            res.status(500).send(formatResponseMessage(util.format('%s', err)));
            clearInterval(timeId)
          } else if (!found) {
            console.log('Category Not Found !');
            res.status(404).send(formatResponseMessage('Category not found: Invalid Category ID'));
            clearInterval(timeId)
          }
        });
      }

      function updateStuff() {
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