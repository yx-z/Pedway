const request = require('supertest');
const {toMatchImageSnapshot} = require('jest-image-snapshot');
expect.extend({toMatchImageSnapshot});
const mongoose = require('mongoose');
const turf = require('@turf/turf');

const {app, disconnect} = require('../src/app');
const EntranceSchema = mongoose.model('entrance');
const {setTestSession} = require('../api/controllers/authController');

beforeAll(async () => {
  setTestSession('1000');
});

afterAll(async () => {
  disconnect();
});

describe('Conditional test using the ors endpoint', () => {
  require('dotenv').config();
  const testIfORSAPIKeyAvailable =
      process.env.ORS_API_KEY === undefined ? test.skip : test;

  testIfORSAPIKeyAvailable(
      'it should respond to the GET method on the directions endpoint',
      (done) => {
        request(app)
            .get(
                '/api/ors/directions?coordinates=-87.631019,%2041.886248%7C-87.623788,%2041.883051&profile=foot-walking')
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(typeof response.body).toBe('object');
              expect(Array.isArray(response.body['routes'])).toBe(true);
              expect(
                  response.body['routes'][0]['segments'][0]['steps'][4]['name'])
                  .toBe('Pedway');
              done();
            });
      });

  describe('Test avoiding closed entrances', () => {
    beforeEach(async () => {
      await EntranceSchema.deleteMany({});
      await (new EntranceSchema({
        'type': 'Feature',
        'geometry':
                   {'type': 'Point', 'coordinates': [-87.6281675, 41.8858832]},
        'id': 'node/1583441295',
      })
          .save());
    });

    testIfORSAPIKeyAvailable(
        'closing a entrance on the route should increase the length of the route',
        async () => {
          // Ensure the entrance is open
          await EntranceSchema
              .findOneAndUpdate({id: 'node/1583441295'}, {status: 'open'})
              .exec();

          // Compute the length of the initial route
          const initialLength =
              await request(app)
                  .get(
                      '/api/ors/directions?coordinates=-87.631019,%2041.886248%7C-87.623788,%2041.883051&profile=foot-walking&geometry_format=polyline')
                  .then((response) => {
                    const route = turf.lineString(response.body['routes'][0]['geometry']);
                    const nearestPoint = turf.nearestPointOnLine(route, turf.point([-87.6281675, 41.8858832]), {units: 'kilometers'});
                    expect(nearestPoint.properties.dist).toBeLessThan(0.005);
                    return response.body['routes'][0]['summary']['distance'];
                  });

          // Close the entrance that lies on the initial route
          await EntranceSchema
              .findOneAndUpdate({id: 'node/1583441295'}, {status: 'closed'})
              .exec();

          // Compute the length of the new route
          const newLength =
              await request(app)
                  .get(
                      '/api/ors/directions?coordinates=-87.631019,%2041.886248%7C-87.623788,%2041.883051&profile=foot-walking&geometry_format=polyline')
                  .then((response) => {
                    const route = turf.lineString(response.body['routes'][0]['geometry']);
                    const nearestPoint = turf.nearestPointOnLine(route, turf.point([-87.6281675, 41.8858832]), {units: 'kilometers'});
                    expect(nearestPoint.properties.dist).toBeGreaterThan(0.005);
                    return response.body['routes'][0]['summary']['distance'];
                  });

          expect(newLength).toBeGreaterThan(initialLength);
        });
  });

  testIfORSAPIKeyAvailable(
      'a tile PNG should be returned from the GET method on the mapsurfer endpoint',
      (done) => {
        jest.setTimeout(10 * 1000);
        request(app)
            // Get a Mapsurfer tile for Millennium Park
            .get('/api/ors/mapsurfer/15/8408/12178.png')
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(response.body).toMatchImageSnapshot({
                customSnapshotIdentifier: 'orsController_millenniumParkTile',
              });
              done();
            });
      });

  testIfORSAPIKeyAvailable(
      'poi information should be returned from the POST method on the poi endpoint',
      (done) => {
        request(app)
            // Send a POST POI request for the block in Chicago that contains
            // the oldest part of the pedway
            .post('/api/ors/pois')
            .send({
              'request': 'pois',
              'geometry': {
                'bbox': [[-87.629378, 41.879475], [-87.627779, 41.878261]],
                'geojson':
                    {'type': 'Point', 'coordinates': [-87.628541, 41.878876]},
                'buffer': 250,
              },
            })
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(typeof response.body).toBe('object');
              expect(Array.isArray(response.body['features'])).toBe(true);
              expect(response.body['features'].some(
                  (f) => f['properties']['osm_tags']['name'] ===
                             'Dirksen Federal Building and US Courthouse'))
                  .toBe(true);
              done();
            });
      });


  testIfORSAPIKeyAvailable(
      'geocode information should be returned from the GET method on the geocode endpoint',
      (done) => {
        request(app)
            .get(
                '/api/ors/geocode/autocomplete?text=pedway&boundary.rect.min_lat=41.765683&boundary.rect.max_lat=41.909595&boundary.rect.min_lon=-87.746445&boundary.rect.max_lon=-87.565921')
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(typeof response.body).toBe('object');
              expect(Array.isArray(response.body['features'])).toBe(true);
              expect(response.body['features'].some(
                  (f) => f['properties']['label'] ===
                             'Pedway, Central, Chicago, IL, USA'))
                  .toBe(true);
              done();
            });
      });
});
