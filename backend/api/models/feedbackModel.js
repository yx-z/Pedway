'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  entranceId: {
    type: String,
  },
  message: {
    type: String,
  },
  reported_status: {
    type: String,
    enum: ['closed', 'dirty', 'closing', 'open'],
  },
  type: {
    type: String,
    enum: ['status', 'bug', 'feedback'],
    required: true,
  },
  Created_date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('feedback', FeedbackSchema);
