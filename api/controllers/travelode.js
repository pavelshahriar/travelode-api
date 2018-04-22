'use strict';

const util = require('util');
const db = require('../../db');
const privacy = require('../../shared/privacyTranslator');
privacy.getAllPrivacy();

module.exports = {
  findTravelodes: findTravelodes,
  createTravelode: createTravelode
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
      res.send(err)
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
