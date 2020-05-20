'use strict';

const ORS_BASE_URL = 'https://api.openrouteservice.org';
const ORS_DIRECTION_URL = 'directions';
const ORS_MAPSURFER_URL = 'mapsurfer/${zoom}/${x}/${y}.png';
const ORS_POIS_URL = 'pois';
const ORS_GEOCODE_URL = 'geocode/autocomplete';

const request = require('request');
const fillTemplate = require('es6-dynamic-template');
const turf = require('@turf/turf');

const PedwayEntrance = mongoose.model('entrance');

if (process.env.ORS_API_KEY === undefined) {
  console.warn(
      'The openrouteservice.org API key is undefined, so any API requests made to ORS will fail.');
}

/**
 * Creates a MultiPolygon of buffers around each closed entrance
 *
 * @return {Promise<MultiPolygon>} the MultiPolygon
 */
function getClosedEntrancePolygons() {
  return new Promise(function(resolve, reject) {
    PedwayEntrance.find(
        {'status': 'closed'}, 'geometry', function(err, entrances) {
          if (err || entrances.length === 0) {
            // Return an empty polygon if the search failed or there are no
            // closed entrances
            resolve(turf.multiPolygon([]).geometry);
          } else {
            // Generate a feature collection of polygons representing a
            // geofence around each entrance coordinate
            const geofences = turf.featureCollection(entrances.map(
                (entrance) => turf.circle(
                    turf.feature(entrance.geometry), 0.005,
                    {units: 'kilometers', steps: 4})));

            // Combine the generated polygons into a MultiPolygon
            const multiPolygonCollection = turf.combine(geofences);

            // Extract the polygon from the feature collection
            resolve(multiPolygonCollection.features[0].geometry);
          }
        });
  });
}

/**
 * Handles the directions endpoint, and forwards the request to ORS
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.directions = function(req, res) {
  getClosedEntrancePolygons().then((multiPolygon) => {
    request
        .get({
          baseUrl: ORS_BASE_URL,
          url: ORS_DIRECTION_URL,
          qs: Object.assign({}, req.query, {
            'api_key': process.env.ORS_API_KEY,
            'options': JSON.stringify({'avoid_polygons': multiPolygon}),
          }),
        })
        .pipe(res);
  });
};

/**
 * Handles the mapsurfer tile endpoint, and forwards the request to ORS
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.mapsurfer = function(req, res) {
  request
      .get({
        baseUrl: ORS_BASE_URL,
        url: fillTemplate(ORS_MAPSURFER_URL, req.params),
        qs: Object.assign({}, req.query, {
          'api_key': process.env.ORS_API_KEY,
        }),
      })
      .pipe(res);
};

/**
 * Handles the poi endpoint, and forwards the request to ORS
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.pois = function(req, res) {
  request
      .post({
        baseUrl: ORS_BASE_URL,
        url: ORS_POIS_URL,
        body: req.body,
        json: true,
        qs: {
          'api_key': process.env.ORS_API_KEY,
        },
      })
      .pipe(res);
};

/**
 * Handles the geocode endpoint, and forwards the request to ORS
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.geocode = function(req, res) {
  request
      .get({
        baseUrl: ORS_BASE_URL,
        url: fillTemplate(ORS_GEOCODE_URL, req.params),
        qs: Object.assign({}, req.query, {
          'api_key': process.env.ORS_API_KEY,
        }),
      })
      .pipe(res);
};
