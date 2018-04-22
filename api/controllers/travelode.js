'use strict';

const util = require('util');
const db = require('../../db');
const privacy = require('../../shared/privacyTranslator');
privacy.getAllPrivacy();

module.exports = {
  findTravelodes: findTravelodes,
  createTravelode: createTravelode,
  getTravelodeById: getTravelodeById,
  updateTravelodeById: updateTravelodeById,
  deleteTravelodeById: deleteTravelodeById
};

const tableNameTravelode = 'travelode';
const selectTravelodeItems = 'title, description, userId, created, updated, coverId';

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
      res.status(500).json(util.format('%s', err));
    }
  });
}

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
      res.json(util.format('%s', 'Travelode Created'));
    }
    else {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
  });
}

function getTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectTravelodeItems +' FROM ' + tableNameTravelode + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
    else if (result.length === 0) {
      console.error('No Travelode Found');
      res.status(404).json(util.format('%s', 'No Travelode Found'));
    }
    else {
      console.log('Get Travelode By Id : ', result);
      res.send(result);
    }
  });
}

function updateTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const travelode_data =  req.swagger.params.travelodeData.value;
  travelode_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query1 = db.query('SELECT ' + selectTravelodeItems + ' FROM ' + tableNameTravelode + ' WHERE id = ?', id, function (err, result) {
    console.log(query1.sql);
    // send error if there is error
    if (err) {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
    // send 404 if the resource was not found
    else if (result.length === 0) {
      console.log('Update Travelode: ', result);
      res.status(404).json(util.format('%s', 'Travelode Not Found'));
    }
    // if resource is available, proceed with updates
    else {
      const query2 = db.query('UPDATE ' + tableNameTravelode + ' SET ? WHERE id = ?', [travelode_data, id], function(err, result) {
        console.log(query2.sql);
        if (!err) {
          console.log('Update Travelode: ', result);
          res.json(util.format('%s', 'Travelode Updated'));
        }
        else {
          console.error(err);
          res.status(500).json(util.format('%s', err));
        }
      });
    }
  });
}

function deleteTravelodeById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameTravelode + ' WHERE id = ?', id, function(err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows === 0) {
      console.log('Delete Travelode: ', result);
      res.status(404).json(util.format('%s', 'Travelode Not Found'));
    }
    // Success
    else {
      console.log('Delete Travelode: ', result);
      res.status(204).json(util.format('%s', 'Travelode Deleted'));
    }
  });
}
