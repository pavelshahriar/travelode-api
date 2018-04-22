'use strict';

const util = require('util');
const db = require('../../db');

module.exports = {
  findUsers: findUsers,
  getUserById: getUserById,
  retrieveUserByLogin: retrieveUserByLogin,
  createUser: createUser,
  updateUserById: updateUserById,
  deleteUserById: deleteUserById
};

const tableNameUser = 'user';
const selectUserItems = 'email, fullname, photo, created, updated';

function findUsers(req, res) {
  const page = req.swagger.params.page.value || 0;
  const size = req.swagger.params.size.value || 50;
  const email = req.swagger.params.email.value || '';
  const fullname = req.swagger.params.fullname.value || '';

  const query = db.query(
      'SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE email LIKE ? AND fullname LIKE ? LIMIT ?, ?',
      ['%'+email+'%', '%'+fullname+'%', (page * size), parseInt(size)], function(err, result) {
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
  const id = req.swagger.params.id.value;
  const query = db.query('SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE id = ? LIMIT 0, 1', id, function(err, result) {
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
  const login_credential = req.swagger.params.loginCredential.value;
  const query = db.query(
      'SELECT '+ selectUserItems +' FROM ' + tableNameUser + ' WHERE email = ? AND password = ? LIMIT 0, 1',
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
  const user_data = req.swagger.params.userData.value;
  user_data['created'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query = db.query('INSERT INTO user SET ?', user_data, function(err, result) {
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
  const id = req.swagger.params.id.value;
  const user_data =  req.swagger.params.userData.value;
  user_data['updated'] = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query1 = db.query('SELECT email FROM ' + tableNameUser + ' WHERE id = ?', id, function (err, result) {
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
      const query2 = db.query('UPDATE user SET ? WHERE id = ?', [user_data, id], function(err, result) {
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
  const id = req.swagger.params.id.value;
  const query = db.query('DELETE FROM ' + tableNameUser + ' WHERE id = ?', id, function(err, result) {
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
