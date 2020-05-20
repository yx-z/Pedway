const request = require('supertest');
const {app, disconnect} = require('../src/app');
const {deleteAll: deleteAllUsers} = require('../api/controllers/userController');

const {deleteAll, auth} = require('../api/controllers/authController');
const roles = require('../src/roles');

const Session = require('../api/models/sessionModel');
const User = require('../api/models/userModel');

afterAll(disconnect);
beforeAll((done)=>{
  deleteAllUsers(()=>{
    const users =
      [{ // valid ADMIN user
        userId: '1111',
        name: '1',
        email: '1@1.com',
        permission: roles.ADMIN,
      }, { // valid user
        userId: '2222',
        name: '2',
        email: '2@2.com',
        permission: roles.NONE,
      }];
    User.collection.insertMany(users, function(err, docs) {
      if (err) {
        done.fail(err);
      } else {
        done();
      }
    });
  });
});

const clean = (done) => {
  deleteAll(()=>{
    const sessions =
      [{ // valid ADMIN session
        userId: '1111',
        sessionId: '1111',
        expiration_date: new Date(Date.now()+1*24*60*60*1000),
      }, { // valid regular session
        userId: '2222',
        sessionId: '2222',
        expiration_date: new Date(Date.now()+1*24*60*60*1000),
      }, { // invalid session
        userId: '2222',
        sessionId: '3333',
        expiration_date: new Date(Date.now()-1*24*60*60*1000),
      }, { // invalid user
        userId: '3333',
        sessionId: '4444',
        expiration_date: new Date(Date.now()+1*24*60*60*1000),
      }];

    Session.collection.insertMany(sessions, function(err, docs) {
      if (err) {
        done.fail(err);
      } else {
        done();
      }
    });
  });
};

describe('Test the auth function', () => {
  beforeEach(clean);

  test('it should clear a valid user', (done) => {
    req = {
      cookies: {
        sessionId: '2222',
      },
    };
    auth(req).then((userId)=>{
      expect(userId).toBe('2222');
      done();
    }).catch(done.fail);
  });

  test('it should clear a valid admin user', (done) => {
    req = {
      cookies: {
        sessionId: '1111',
      },
    };
    auth(req).then((userId)=>{
      expect(userId).toBe('1111');
      done();
    }).catch(done.fail);
  });

  test('it should admin clear a valid admin user', (done) => {
    req = {
      cookies: {
        sessionId: '1111',
      },
    };
    auth(req, roles.ADMIN).then((userId)=>{
      expect(userId).toBe('1111');
      done();
    }).catch(done.fail);
  });

  test('it should not admin clear a non admin user', (done) => {
    req = {
      cookies: {
        sessionId: '2222',
      },
    };
    auth(req, roles.ADMIN).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('Invalid permissions'));
      done();
    });
  });

  test('it should not clear an expired session', (done) => {
    req = {
      cookies: {
        sessionId: '3333',
      },
    };
    auth(req).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('Your session has expired'));
      done();
    });
  });

  test('it should not admin clear an expired session', (done) => {
    req = {
      cookies: {
        sessionId: '3333',
      },
    };
    auth(req, roles.ADMIN).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('Your session has expired'));
      done();
    });
  });

  test('it should not clear a non existent user', (done) => {
    req = {
      cookies: {
        sessionId: '4444',
      },
    };
    auth(req).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('No valid user exists'));
      done();
    });
  });

  test('it should not admin clear a non existent user', (done) => {
    req = {
      cookies: {
        sessionId: '4444',
      },
    };
    auth(req, roles.ADMIN).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('No valid user exists'));
      done();
    });
  });

  test('it should not clear a non existent session', (done) => {
    req = {
      cookies: {
        sessionId: '5555',
      },
    };
    auth(req).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('No valid session exists'));
      done();
    });
  });

  test('it should not admin clear a non existent session', (done) => {
    req = {
      cookies: {
        sessionId: '5555',
      },
    };
    auth(req, roles.ADMIN).then((userId)=>{
      done.fail('should have caught');
    }).catch((err)=>{
      expect(err).toEqual(Error('No valid session exists'));
      done();
    });
  });
});

describe('Test the root of the user api', () => {
  beforeEach(clean);

  test('it should respond to the GET method as admin', (done) => {
    request(app)
        .get('/api/auth')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(4);
          done();
        });
  });

  test('it should not respond to the GET method for regular', (done) => {
    request(app)
        .get('/api/auth')
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          done();
        });
  });


  test('it should respond to the DELETE method', (done) => {
    request(app)
        .delete('/api/auth')
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);

          request(app)
              .get('/api/auth/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response) => {
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body).toEqual(null);
                done();
              });
        });
  });

  test('it should not respond to the DELETE method for invalid', (done) => {
    request(app)
        .delete('/api/auth')
        .set('Cookie', ['sessionId=3333'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);

          request(app)
              .get('/api/auth/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response) => {
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body.userId).toBe('2222');
                expect(response.body.sessionId).toBe('2222');
                done();
              });
        });
  });
});

describe('Test specific auth sessions api', () => {
  beforeEach(clean);

  test('it should respond to the GET method for admin', (done) => {
    request(app)
        .get('/api/auth/2222')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);
          expect(response.body.userId).toBe('2222');
          expect(response.body.sessionId).toBe('2222');

          done();
        });
  });

  test('it should not respond to the GET method for invalid', (done) => {
    request(app)
        .get('/api/auth/1111')
        .set('Cookie', ['sessionId=3333'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          done();
        });
  });

  test('it should not respond to the GET method for nonexistent', (done) => {
    request(app)
        .get('/api/auth/1111')
        .set('Cookie', ['sessionId=4444'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);
          done();
        });
  });

  test('it should respond to the DELETE method for admin', (done) => {
    request(app)
        .delete('/api/auth/2222')
        .set('Cookie', ['sessionId=1111'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(200);

          request(app)
              .get('/api/auth/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response) => {
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body).toBe(null);
                done();
              });
        });
  });

  test('it should respond to the DELETE method for regular', (done) => {
    request(app)
        .delete('/api/auth/2222')
        .set('Cookie', ['sessionId=2222'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);

          request(app)
              .get('/api/auth/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response) => {
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body.sessionId).toBe('2222');
                expect(response.body.userId).toBe('2222');
                done();
              });
        });
  });

  test('it should respond to the DELETE method for invalid', (done) => {
    request(app)
        .delete('/api/auth/2222')
        .set('Cookie', ['sessionId=3333'])
        .end((err, response) => {
          expect(err).toBe(null);
          expect(response.statusCode).toBe(401);

          request(app)
              .get('/api/auth/2222')
              .set('Cookie', ['sessionId=1111'])
              .end((err, response) => {
                expect(err).toBe(null);
                expect(response.statusCode).toBe(200);
                expect(response.body.sessionId).toBe('2222');
                expect(response.body.userId).toBe('2222');
                done();
              });
        });
  });
});
