'use strict';
module.exports = function(app) {
  const auth = require('../controllers/authController');

  // todoList Routes
  app.route('/api/auth')
      .get(auth.listSessions)
      .post(auth.login)
      .delete(auth.logout);


  app.route('/api/auth/:sessionId')
      .get(auth.getSession)
      .delete(auth.invalidateSession);
};
