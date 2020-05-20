const request = require('supertest');
const {app, disconnect} = require('../src/app');
const {setTestSession} = require('../api/controllers/authController');
const Feedback = mongoose.model('feedback');


afterAll(disconnect);

beforeAll(()=>{
  setTestSession('1000');
});

describe('Test the root of the feedback api', () => {
  beforeEach((done) => {
    Feedback.remove({}, done);
  });

  test('retriving an empty list of feedback via GET', (done) => {
    request(app)
        .get('/api/feedback')
        .set('Cookie', ['sessionId=1000'])
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(0);
          done();
        });
  });

  test('retriving a list of feedback via GET', (done) => {
    request(app)
        .post('/api/feedback')
        .send({
          message: 'My Feedback',
          reported_status: 'open',
          entranceId: '303',
          type: 'feedback',
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).not.toHaveProperty('errors');
          request(app)
              .get('/api/feedback')
              .set('Cookie', ['sessionId=1000'])
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBe(1);
                expect(typeof response.body[0]).toBe('object');
                expect(response.body[0]['message']).toBe('My Feedback');
                expect(response.body[0]['reported_status']).toBe('open');
                expect(response.body[0]['entranceId']).toBe('303');
                expect(response.body[0]['type']).toBe('feedback');
                expect(response.body[0]).toHaveProperty('_id');
                done();
              });
        });
  });

  test.each([{
    message: 'My Feedback1',
    reported_status: 'open',
    entranceId: '101',
    type: 'status',
  }, {
    message: 'My Feedback2',
    reported_status: 'dirty',
    entranceId: '101',
    type: 'status',
  }, {
    message: 'My Feedback3',
    reported_status: 'open',
    entranceId: '101',
    type: 'status',
  }, {
    message: 'Sometimes tests fail',
    entranceId: '101',
    type: 'bug',
  }, {
    message: 'Ewww, I see a bug',
    reported_status: 'dirty',
    entranceId: '101',
    type: 'bug',
  }, {
    message: 'Great App!',
    entranceId: '101',
    type: 'feedback',
  }])('Adding a single feedback via POST', (feedback, done) => {
    request(app)
        .post('/api/feedback')
        .send(feedback)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body).not.toHaveProperty('errors');
          expect(typeof response.body).toBe('object');
          expect(response.body['message']).toBe(feedback.message);
          expect(response.body['type']).toBe(feedback.type);
          if (feedback.reported_status !== undefined) {
            expect(response.body['reported_status']).toBe(feedback.reported_status);
          }
          expect(response.body['entranceId']).toBe(feedback.entranceId);
          expect(response.body).toHaveProperty('_id');

          const id = response.body['_id'];

          request(app)
              .get('/api/feedback')
              .set('Cookie', ['sessionId=1000'])
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length).toBe(1);
                expect(response.body[0]['_id']).toBe(id);
                expect(response.body[0]['message']).toBe(feedback.message);
                expect(response.body[0]['type']).toBe(feedback.type);
                if (feedback.reported_status !== undefined) {
                  expect(response.body[0]['reported_status']).toBe(feedback.reported_status);
                }
                expect(response.body[0]['entranceId']).toBe(feedback.entranceId);
                done();
              });
        });
  });
});

describe('Testing specific feedback entries in the feedback api', () => {
  let id;
  beforeEach((done) => {
    // Clear data and Upload test status to the API
    Feedback.remove({}, () => {
      request(app)
          .post('/api/feedback')
          .send({
            message: 'My best feedback',
            reported_status: 'open',
            entranceId: '909',
            type: 'status',
          })
          .then((response) => {
            id = response.body['_id'];
            done();
          });
    });
  });

  test('retriving a single feedback entry', (done) => {
    request(app)
        .get('/api/feedback/' + id)
        .set('Cookie', ['sessionId=1000'])
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(typeof response.body).toBe('object');
          expect(response.body['_id']).toBe(id);
          expect(response.body['message']).toBe('My best feedback');
          expect(response.body['reported_status']).toBe('open');
          expect(response.body['entranceId']).toBe('909');
          expect(response.body['type']).toBe('status');
          done();
        });
  });

  test('updating a single feedback via POST', (done) => {
    request(app)
        .post('/api/feedback/' + id)
        .set('Cookie', ['sessionId=1000'])
        .send({
          message: 'My better feedback',
          reported_status: 'closed',
          entranceId: '919',
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          request(app)
              .get('/api/feedback')
              .set('Cookie', ['sessionId=1000'])
              .then((response) => {
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body.length > 0).toBe(true);
                expect(response.body[0]['_id']).toBe(id);
                expect(response.body[0]['message']).toBe('My better feedback');
                expect(response.body[0]['reported_status']).toBe('closed');
                expect(response.body[0]['entranceId']).toBe('919');

                // Check if the database has been updated
                request(app)
                    .get('/api/feedback/' + id)
                    .set('Cookie', ['sessionId=1000'])
                    .then((response) => {
                      expect(response.statusCode).toBe(200);
                      expect(typeof response.body).toBe('object');
                      expect(response.body['_id']).toBe(id);
                      expect(response.body['message']).toBe('My better feedback');
                      expect(response.body['reported_status']).toBe('closed');
                      expect(response.body['entranceId']).toBe('919');
                      done();
                    });
              });
        });
  });

  test(
      'removing a single feedback ENTRY via DELETE',
      (done) => {
        request(app)
            .delete('/api/feedback/' + id)
            .set('Cookie', ['sessionId=1000'])
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(typeof response.body).toBe('object');
              expect(response.body['message'])
                  .toBe('Feedback successfully deleted');

              // Check if the database has been updated
              request(app)
                  .get('/api/feedback')
                  .set('Cookie', ['sessionId=1000'])
                  .then((response) => {
                    expect(Array.isArray(response.body)).toBe(true);
                    expect(response.statusCode).toBe(200);
                    expect(response.body.length).toBe(0);
                    done();
                  });
            });
      });
});
