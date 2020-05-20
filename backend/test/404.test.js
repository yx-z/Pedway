const request = require('supertest');
const {app, disconnect} = require('../src/app');

afterAll(disconnect);

describe('Test 404', () => {
  test('unknown pages should return status code 404 and redirect', (done) => {
    request(app).get('/do_not_exist').then((response) => {
      expect(response.statusCode).toBe(404);
      expect(response.text.length > 0).toBe(true);
      done();
    });
  });

  test('known pages should return status code 200', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
