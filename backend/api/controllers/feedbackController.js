'use strict';

const {auth} = require('./authController');
const roles = require('../../src/roles');
const util = require('./util');

const mongoose = require('mongoose');
const Feedback = mongoose.model('feedback');


/**
* @description returns all feedback currently inside the database
* @param {request} req is the request received
* @param {res} res is the response object for making responses
*/
exports.listFeedback = function(req, res) {
  auth(req, roles.ADMIN).then(()=>{
    util.getAllData(Feedback)(req, res);
  });
};

/**
* @description creates and saves a new feedback entry
* @param {request} req is the request received
* @param {res} res is the response object for making responses
*/
exports.createFeedback = util.createData(Feedback);

/**
* @description allows the reading of an individual feedback entry
* @param {request} req is the request received
* @param {res} res is the response object for making responses
*/
exports.readFeedback = function(req, res) {
  auth(req, roles.ADMIN).then((userId)=>{
    Feedback.findById(req.params.id, function(err, feedback) {
      if (err) {
        res.send(err);
      } else {
        res.json(feedback);
      }
    });
  });
};

/**
* @description update a specific feedback entry
* @param {request} req is the request received
* @param {res} res is the response object for making responses
*/
exports.updateFeedback = function(req, res) {
  auth(req, roles.ADMIN).then((userId)=> {
    Feedback.findOneAndUpdate(
        {_id: req.params.id}, req.body, {new: true},
        function(err, feedback) {
          if (err) {
            res.send(err);
          } else {
            res.json(feedback);
          }
        });
  });
};

/**
* @description deletes a specific feedback entry
* @param {request} req is the request received
* @param {res} res is the response object for making responses
*/
exports.deleteFeedback = function(req, res) {
  auth(req, roles.ADMIN).then((userId)=> {
    Feedback.deleteOne({_id: req.params.id}, function(err, task) {
      if (err) {
        res.send(err);
      } else {
        res.json({message: 'Feedback successfully deleted'});
      }
    });
  });
};
