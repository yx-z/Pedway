'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: false,
  },
  sessionId: {
    type: String,
    required: true,
    index: true, // Create a new index
    unique: true, // Each session token must be unique
  },
  expiration_date: {
    type: Date,
    required: true,
  },
});
module.exports = mongoose.model('session', SessionSchema);
