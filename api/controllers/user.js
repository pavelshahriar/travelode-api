'use strict';

var util = require('util');
var db = require('../../db');

module.exports = {
  findUsers: findUsers,
  getUserById: getUserById,
  retrieveUserByLogin: retrieveUserByLogin,
  createUser: createUser,
  updateUserById: updateUserById,
  deleteUserById: deleteUserById
};

var selectItems = 'id, email, fullname, photo';

function findUsers(req, res) {
  var page = req.swagger.params.page.value || 0;
  var size = req.swagger.params.size.value || 50;
  var email = req.swagger.params.email.value || 'com';
  var fullname = req.swagger.params.fullname.value || '';

  var query = db.query(
      'SELECT '+ selectItems +' FROM user WHERE email LIKE ? AND fullname LIKE ? LIMIT ' + (page * size) + ', ' + size,
      ['%'+email+'%', '%'+fullname+'%'], function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Find Users: ', result);
      res.send(result);
    }
    else {
      console.error(err);
      res.send(err)
    }
  });
}

function getUserById(req, res) {
  var id = req.swagger.params.id.value;
  var query = db.query('SELECT '+ selectItems +' FROM user WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Get User By Id : ', result);
      res.send(result);
    }
    else {
      console.error(err);
      res.send(err)
    }
  });
}

function retrieveUserByLogin(req, res) {
  var login_credential = req.swagger.params.loginCredential.value;
  var query = db.query(
      'SELECT '+ selectItems +' FROM user WHERE email = ? AND password = ? LIMIT 0, 1',
      [login_credential.email, login_credential.password], function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Retrieve User By Login : ', result);
      res.send(result);
    }
    else {
      console.error(err);
      res.send(err)
    }
  });
}

function createUser(req, res) {
  var user_data = req.swagger.params.userData.value;
  var query = db.query('INSERT INTO user SET ?', user_data, function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('User Created: ', result);
      res.json(util.format('%s', 'User Created'));
    }
    else {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
  });
}

function updateUserById(req, res) {
  var id = req.swagger.params.id.value;
  var user_data =  req.swagger.params.userData.value;

  var query1 = db.query('SELECT email FROM user WHERE id = ?', id, function (err, result) {
    console.log(query1.sql);
    // send error if there is error
    if (err) {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
    // send 404 if the resource was not found
    else if (result.length === 0) {
      console.log('Update User: ', result);
      res.status(404).json(util.format('%s', 'User Not Found'));
    }
    // if resource is available, proceed with updates
    else {
      var query2 = db.query('UPDATE user SET ? WHERE id = ?', [user_data, id], function(err, result) {
        console.log(query2.sql);
        if (!err) {
          console.log('Update User: ', result);
          res.json(util.format('%s', 'User Updated'));
        }
        else {
          console.error(err);
          res.status(500).json(util.format('%s', err));
        }
      });
    }
  });
}

function deleteUserById(req, res) {
  var id = req.swagger.params.id.value;
  var query = db.query('DELETE FROM user WHERE id = ?', id, function(err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).json(util.format('%s', err));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows === 0) {
      console.log('Update User: ', result);
      res.status(404).json(util.format('%s', 'User Not Found'));
    }
    // Success
    else {
      console.log('Delete User: ', result);
      res.json(util.format('%s', 'User Deleted'));
    }
  });
}