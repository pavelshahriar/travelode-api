'use strict';

const util = require('util');
const db = require('../../db');
const privacy = require('../helpers/privacyTranslator');
const formatResponseMessage = require('../helpers/formatResponseMessage');
const travelodeService = require('../services/travelodeService');

privacy.getAllPrivacy();

module.exports = {
  findTravelodes: findTravelodes,
  createTravelode: createTravelode,
  getTravelodeById: getTravelodeById,
  updateTravelodeById: updateTravelodeById,
  deleteTravelodeById: deleteTravelodeById
};

const tableNameTravelode = 'travelode';
const selectTravelodeItems = 'id, title, description, userId, created, updated, coverId';

// GET /travelode
function findTravelodes(req, res) {
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const title = req.swagger.params.title.value || '';
  const userId = req.swagger.params.userId.value || '';
  const privacyPublic = privacy.privacyMatrix.findIndex(el => el === 'public');

  const query = db.query(
    'SELECT '+ selectTravelodeItems +' FROM ' + tableNameTravelode + ' WHERE title LIKE ? AND userId LIKE ? AND privacy = ? LIMIT ?, ?',
    ['%'+title+'%', '%'+userId+'%', privacyPublic ,(page * size), parseInt(size)], function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Find Travelode: ', result);
      res.send(result);
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

// POST /travelode
function createTravelode(req, res) {
  const travelode_data = {
    "title" : req.swagger.params.title.value,
    "description" : req.swagger.params.description.value,
    "userId" : req.swagger.params.userId.value,
    "privacy" : privacy.privacyMatrix.findIndex(el => el === 'public'),
    "created" : new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  const query = db.query('INSERT INTO ' + tableNameTravelode + ' SET ?', travelode_data, function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Travelode Created: ', result);
      res.status(201).send(formatResponseMessage("Travelode Created", result.insertId));
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

// GET /travelode/{id}
function getTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectTravelodeItems +' FROM ' + tableNameTravelode + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (result.length === 0) {
      console.error('No Travelode Found');
      res.status(404).send(formatResponseMessage('No Travelode Found'));
    }
    else {
      console.log('Get Travelode By Id : ', result);
      res.send(result);
    }
  });
}

// PUT /travelode/{id}
function updateTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const travelode_data =  req.swagger.params.travelodeData.value;
  travelode_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  travelodeService.isTravelodeValid(id, function (err, found) {
    if (err) {
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    } else if (!found) {
      console.log('Travelode Not Found !');
      res.status(404).send(formatResponseMessage('Travelode not found'));
    } else {

      const query = db.query('UPDATE ' + tableNameTravelode + ' SET ? WHERE id = ?', [travelode_data, id], function(err, result) {
        console.log(query.sql);
        if (!err) {
          console.log('Update Travelode: ', result);
          res.send(formatResponseMessage('Travelode Updated'));
        }
        else {
          console.error(err);
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        }
      });
    }
  });
}

// DELETE /travelode/{id}
function deleteTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameTravelode + ' WHERE id = ?', id, function(err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows === 0) {
      console.log('Delete Travelode: ', result);
      res.status(404).send(formatResponseMessage('Travelode Not Found'));
    }
    // Success
    else {
      console.log('Delete Travelode: ', result);
      res.status(204).send(formatResponseMessage('Travelode Deleted'));
    }
  });
}
