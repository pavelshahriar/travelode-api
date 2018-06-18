'use strict';

const util = require('util');
const db = require('../../db');
const formatResponseMessage = require('../helpers/formatResponseMessage');

module.exports = {
  findUsers: findUsers,
  createUser: createUser,
  getUserById: getUserById,
  retrieveUserByLogin: retrieveUserByLogin,
  updateUserById: updateUserById,
  deleteUserById: deleteUserById
};

const tableNameUser = 'user';
const selectUserItems = 'id, email, fullname, photo, created, updated';

function findUsers(req, res) {
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const email = req.swagger.params.email.value || '';
  const fullname = req.swagger.params.fullname.value || '';

  const query = db.query(
      'SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE email LIKE ? OR fullname LIKE ? LIMIT ?, ?',
      ['%'+email+'%', '%'+fullname+'%', (page * size), parseInt(size)], function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('Find Users: ', result);
      res.send(result);
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

function createUser(req, res) {
  const user_data = {
    "email" : req.swagger.params.email.value,
    "password" : req.swagger.params.password.value,
    "created" : new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  const query = db.query('INSERT INTO user SET ?', user_data, function(err, result) {
    console.log(query.sql);
    if (!err) {
      console.log('User Created: ', result);
      res.status(201).send(formatResponseMessage("User Created", result.insertId));
    }
    else {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
  });
}

function getUserById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    else if (result.length === 0) {
      console.error('No User Found');
      res.status(404).send(formatResponseMessage('No User Found'));
    }
    else {
      console.log('Get User By Id : ', result);
      res.send(result);
    }
  });
}

function updateUserById(req, res) {
  const id = req.swagger.params.id.value;
  const user_data =  req.swagger.params.userData.value;
  user_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query1 = db.query('SELECT ' + selectUserItems + ' FROM ' + tableNameUser + ' WHERE id = ?', id, function (err, result) {
    console.log(query1.sql);
    // send error if there is error
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // send 404 if the resource was not found
    else if (result.length === 0) {
      console.log('Update User: ', result);
      res.status(404).send(formatResponseMessage('User Not Found'));
    }
    // if resource is available, proceed with updates
    else {
      const query2 = db.query('UPDATE ' + tableNameUser + ' SET ? WHERE id = ?', [user_data, id], function(err, result) {
        console.log(query2.sql);
        if (!err) {
          console.log('Update User: ', result);
          res.send(formatResponseMessage('User Updated'));
        }
        else {
          console.error(err);
          res.status(500).send(formatResponseMessage(util.format('%s', err)));
        }
      });
    }
  });
}

function deleteUserById(req, res) {
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameUser + ' WHERE id = ?', id, function(err, result) {
    console.log(query.sql);
    // Check for errors
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // Send 404 if the resource is not found
    else if (result.affectedRows === 0) {
      console.log('Delete User: ', result);
      res.status(404).send(formatResponseMessage('User Not Found'));
    }
    // Success
    else {
      console.log('Delete User: ', result);
      res.status(204).send(formatResponseMessage('User Deleted'));
    }
  });
}

function retrieveUserByLogin(req, res) {
  const login_credential = {
    "email" : req.swagger.params.email.value,
    "password" : req.swagger.params.password.value
  };

  const query = db.query(
      'SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE email = ? AND password = ? LIMIT 0, 1',
      [login_credential.email, login_credential.password], function(err, result) {
    console.log(query.sql);
    if (err) {
      console.error(err);
      res.status(500).send(formatResponseMessage(util.format('%s', err)));
    }
    // Send 401 if the resource is not found
    else if (result.length === 0){
      console.log('Invalid Login Credentials');
      res.status(401).send(formatResponseMessage('Invalid Login Credentials'));
    }
    // Success
    else {
      console.log('Retrieve User By Login : ', result);
      res.send(result);
    }
  });
}
