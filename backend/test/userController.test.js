const request = require('supertest');
const {app, disconnect} = require('../src/app');
const {deleteAll: deleteAllSessions}
  = require('../api/controllers/authController');
const {deleteAll} = require('../api/controllers/userController');

const Session = require('../api/models/sessionModel');
const User = require('../api/models/userModel');

afterAll(disconnect);
beforeAll((done)=>{
  deleteAllSessions(()=>{
    const sessions =
      [{ // valid ADMIN session
        userId: '1111',
        sessionId: '1111',
        expiration_date: new Date(Date.now()+1*24*60*60*1000),
      }, { // valid session
        userId: '2222',
        sessionId: '2222',
        expiration_date: new Date(Date.now()+1*24*60*60*1000),
      }];

    Session.collection.insertMany(sessions, function(err, docs) {
      if (err) {
        console.error(err);
        expect(true).toBe(false);
      } else {
        done();
      }
    });
  });
});

beforeEach((done) => {
  deleteAll(()=>{
    const users =
      [{ // valid ADMIN user
        userId: '1111',
        name: '1',
        email: '1@1.com',
        permission: 'ADMIN',
      }, { // valid user
        userId: '2222',
        name: '2',
        email: '2@2.com',
        permission: 'NONE',
      }];
    User.collection.insertMany(users, function(err, docs) {
      if (err) {
        console.error(err);
        expect(true).toBe(false);
      } else {
        done();
      }
    });
  });
});

describe('Test the root of the user api', () => {
  test('it should respond to the GET method as admin', (done) => {
    request(app)
        .get('/api/user')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(2);
          done();
        });
  });

  test('it should not respond to the GET method for regular users', (done) => {
    request(app)
        .get('/api/user')
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          expect(response.body).toEqual({});
          done();
        });
  });

  test('it should respond to the POST method', (done) => {
    request(app)
        .post('/api/user')
        .send({
          email: 'test@gmail.com',
          name: 'test',
          userId: '0000',
        }).end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(response.body.email).toBe('test@gmail.com');
          expect(response.body.name).toBe('test');
          expect(response.body.userId).toBe('0000');
          expect(response.body.permission).toBe('NONE');

          // Make sure you can find the new user
          request(app)
              .get('/api/user/0000')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response)=>{
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body.email).toBe('test@gmail.com');
                expect(response.body.name).toBe('test');
                expect(response.body.userId).toBe('0000');
                expect(response.body.permission).toBe('NONE');
                done();
              });
        });
  });

  test('it should not respond to the POST method without email', (done) => {
    request(app)
        .post('/api/user')
        .send({
          name: 'test',
          userId: '0000',
        }).end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(400);
          expect(response.body.error).toBe('Please specify an email');
          done();
        });
  });

  test('it should not respond to the POST method without userid', (done) => {
    request(app)
        .post('/api/user')
        .send({
          email: 'test@gmail.com',
          name: 'test',
        }).end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(400);
          expect(response.body.error).toBe('Please specify a userId');
          done();
        });
  });
});

describe('Test specific users api', () => {
  test('it should respond to the GET method as admin', (done) => {
    request(app)
        .get('/api/user/1111')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(response.body.email).toBe('1@1.com');
          expect(response.body.name).toBe('1');
          expect(response.body.userId).toBe('1111');
          expect(response.body.permission).toBe('ADMIN');
          done();
        });
  });

  test('it should respond to the GET method as admin 2', (done) => {
    request(app)
        .get('/api/user/2222')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(response.body.email).toBe('2@2.com');
          expect(response.body.name).toBe('2');
          expect(response.body.userId).toBe('2222');
          expect(response.body.permission).toBe('NONE');
          done();
        });
  });

  test('it should respond to the POST method as admin', (done) => {
    request(app)
        .post('/api/user/2222')
        .send({
          email: 'new@2.com',
          name: 'newName',
        })
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);

          request(app)
              .get('/api/user/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response)=>{
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body.email).toBe('new@2.com');
                expect(response.body.name).toBe('newName');
                expect(response.body.userId).toBe('2222');
                expect(response.body.permission).toBe('NONE');
                done();
              });
        });
  });

  test('it should not respond to the POST method', (done) => {
    request(app)
        .post('/api/user/2222')
        .send({
          email: 'new@2.com',
          name: 'newName',
        })
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          done();
        });
  });


  test('it should respond to the DELETE method as admin', (done) => {
    request(app)
        .delete('/api/user/2222')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);

          request(app)
              .get('/api/user/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response)=>{
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body).toBe(null);
                done();
              });
        });
  });

  test('it should not respond to the DELETE method', (done) => {
    request(app)
        .delete('/api/user/1111')
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          done();
        });
  });
});
