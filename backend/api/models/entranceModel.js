'use strict';
require('mongoose-geojson-schema');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntranceSchema = new Schema({
  id: {
    type: String,
    required: 'The OSM id',
    unique: true,
  },
  geometry: mongoose.Schema.Types.Geometry,
  Created_date: {type: Date, default: Date.now},
  status: {
    type: String,
    enum: ['closed', 'dirty', 'closing', 'open'],
    default: 'open',
  },
});

module.exports = mongoose.model('entrance', EntranceSchema);
