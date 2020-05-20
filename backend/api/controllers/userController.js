const mongoose = require('mongoose');
const User = mongoose.model('user');

const {auth} = require('./authController');
const roles = require('../../src/roles');
const util = require('./util');

exports.listUsers = function(req, res) {
  auth(req, roles.ADMIN).then((userId)=>{
    util.getAllData(User)(req, res);
  }).catch((err)=>res.status(401).send(err));
};


exports.signup = function(req, res) {
  const newUserId = req.body.userId;
  const newEmail = req.body.email;
  const newName = req.body.name;

  if (newUserId == null) {
    // not authorized
    res.status(400).json({error: 'Please specify a userId'});
    return;
  } else if (newEmail == null) {
    // not authorized
    res.status(400).json({error: 'Please specify an email'});
    return;
  }

  const newUser = new User({
    userId: newUserId,
    email: newEmail,
    name: newName,
    // If this is the default admin email, make it an admin
    permission: process.env.DEFAULT_ADMIN_EMAIL === newEmail
      ?roles.ADMIN:roles.NONE,
  });
  newUser.save(function(err, status) {
    if (err) {
      res.send(err);
    } else {
      res.json(status);
    }
  });
};

exports.deleteUser = function(req, res) {
  auth(req, roles.ADMIN).then(() => {
    User.deleteOne({userId: req.params.userId}, function(err, user) {
      if (err) res.send(err);
      res.json({message: 'Sucessfully deleted user'});
    });
  }).catch((err)=>res.status(401).send(String(err)));
};

exports.getUser = function(req, res) {
  auth(req).then(() => {
    User.findOne({userId: req.params.userId}, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }).catch((err)=>res.status(401).send(err));
};

exports.updateUser = function(req, res) {
  auth(req, roles.ADMIN).then(() => {
    User.findOneAndUpdate({userId: req.params.userId}, req.body, {new: true},
        function(err, user) {
          if (err) {
            res.send(err);
          }
          res.json(user);
        });
  }).catch((err)=>res.status(401).send(err));
};

// Helper function for testing purposes
exports.deleteAll = function(callback) {
  // console.warn('This function should only be called for testing purposes')
  User.deleteMany({}, callback);
};
