'use strict';
require('mongoose-geojson-schema');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  properties: {
    OBJECTID: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
      unique: true,
    },
    PED_ROUTE: {type: String, required: true},
    SHAPE_LEN: {type: Number, required: true},
  },
  geometry: mongoose.Schema.Types.Geometry,
  Created_date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('section', SectionSchema);
