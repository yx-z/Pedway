const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '526092300621-j8ki44lp0fpnb5da2s3c3iqu33fde3tk.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const uuidv4 = require('uuid/v4');

const mongoose = require('mongoose');
const User = mongoose.model('user');
const Session = mongoose.model('session');
const roles = require('../../src/roles');
const util = require('./util');

// Set timeout 1 day from now
const timeout = 1*24*60*60*1000;

// test session, must only be used for testing
let testSession = null;

/**
 * @return {string} a secure session token
 */
function generateKey() {
  // https://gist.github.com/joepie91/7105003c3b26e65efcea63f3db82dfba
  // This is by far the most important part of our security strategy
  return uuidv4();
}

/**
* @description This function returns a promise
*    that returns the userId of this session
*    or it rejects if session is invalid
* @param {request} req is the request received
* @param {role} level is the role you must have inorder to be authenticated
* @return {promise} a promise that can be used for authentication
*/
exports.auth = function(req, level=roles.NONE) {
  return new Promise(function(resolve, reject) {
    const sessionId = req.cookies.sessionId;

    // If we are in a testing mode
    if (process.env.JEST_WORKER_ID !== undefined) {
      if (testSession === sessionId) {
        // This must ONLY RUN in testing
        resolve(testSession);
        return;
      }
    }

    if (sessionId == null || sessionId == undefined) {
      reject(Error('No sessionId provided'));
    }
    Session.findOne({sessionId: sessionId}, function(err, session) {
      if (err) {
        reject(err);
        return;
      }
      // No session exists
      if (!session) {
        reject(Error('No valid session exists'));
        return;
      }

      // Session has expired
      if (session.expiration_date < Date.now()) {
        reject(Error('Your session has expired'));
        return;
      }

      User.findOne({userId: session.userId}, function(err, user) {
        if (err) reject(Error(err));

        // Make sure user exists
        if (!user) {
          reject(Error('No valid user exists'));
          return;
        }

        if (level === roles.NONE) {
          resolve(session.userId);
        } else {
          // Make sure user has valid permission
          if (user.permission === level) {
            resolve(user.userId);
          } else {
            reject(Error('Invalid permissions'));
          }
        }
      });
    });
  });
};

/**
* @description returns the current list of sessions
*   must be an admin to view
* @param {request} req is the request received
* @param {response} res is the response object
*/
exports.listSessions = function(req, res) {
  exports.auth(req, roles.ADMIN).then((userId)=>{
    util.getAllData(Session)(req, res);
  }).catch((err)=>res.status(401).send(err));
};

/**
* @description returns the info for a specific session
*   must be an admin to view
* @param {request} req is the request received
* @param {response} res is the response object
*/
exports.getSession = function(req, res) {
  exports.auth(req, roles.ADMIN).then((userId)=>{
    Session.findOne({sessionId: req.params.sessionId}, function(err, session) {
      if (err) res.send(err);
      res.json(session);
    });
  }).catch((err)=>res.status(401).send(err));
};

/**
* @description allows a new session to be created for a user
*   must use google to authenticate
* @param {request} req is the request received
* @param {response} res is the response object
*/
exports.login = function(req, res) {
  /**
  * @param {object} body of the request
  * @return {object} the verified payload from google
  */
  async function verify(body) {
    const ticket = await client.verifyIdToken({
      idToken: body.idtoken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }

  verify(req.body).then((payload)=>{
    const userId = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    User.findOne({userId: userId}, function(err, doc) {
      if (err) {
        res.status(500).send(null);
        return;
      }
      if (doc === null) {
        res.status(400).send('No valid user exists for: ' + String(userId));
        return;
      }

      const newSession = new Session({
        userId: doc.userId,
        sessionId: generateKey(),
        expiration_date: new Date(Date.now()+timeout),
      });

      newSession.save(function(err, session) {
        if (err) {
          res.send(err);
        } else {
          res.json(session);
        }
      });
    });
  }).catch((err)=>{
    res.status(500);
    res.send(String(err));
  });
};

/**
* @description stops and drops the current session of the user
* @param {request} req is the request received
* @param {response} res is the response object
*/
exports.logout = function(req, res) {
  Session.deleteOne({sessionId: req.cookies.sessionId}, function(err, task) {
    if (err) res.send(err);
    res.json({message: 'Sucessfully logged out'});
  });
};

/**
* @description allows an admin to invalidate a session
*   must be an admin to invalidate a session
* @param {request} req is the request received
* @param {response} res is the response object
*/
exports.invalidateSession = function(req, res) {
  exports.auth(req, roles.ADMIN).then(()=>{
    Session.deleteOne({sessionId: req.params.sessionId}, function(err, task) {
      if (err) res.send(err);
      res.json({message: 'Sucessfully dropped session'});
    });
  }).catch((err)=>res.status(401).send(String(err)));
};

/**
* @description drops all sessions in the database
* @param {function} callback is a callback to be run after finishing deleting
* @param {response} res is the response object
*/
exports.deleteAll = function(callback) {
  // We must be running in a test:
  if (process.env.JEST_WORKER_ID === undefined) {
    throw new Error('Must not run this function outside of tests');
  }
  Session.deleteMany({}, callback);
};


/**
* @description sets a test session for testing purposes
* @param {sessionId} sessionId to be used for testing
*/
exports.setTestSession = function(sessionId) {
  // We must be running in a test:
  if (process.env.JEST_WORKER_ID === undefined) {
    throw new Error('Must not run this function outside of tests');
  }
  testSession = sessionId;
};
