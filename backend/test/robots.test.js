const request = require('supertest');
const {app, disconnect} = require('../src/app');

afterAll(disconnect);

describe('Test robot.txt', () => {
  test('Server should serve robot.txt', (done) => {
    request(app).get('/robots.txt').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
