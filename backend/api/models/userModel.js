'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../../src/roles');

const UserSchema = new Schema({
  userId: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  email: String,
  name: String,
  created_date: {
    type: Date,
    default: Date.now,
  },
  permission: {
    type: String,
    enum: Object.values(roles), // All the different roles
    default: roles.NONE,
  },
});

module.exports = mongoose.model('user', UserSchema);
