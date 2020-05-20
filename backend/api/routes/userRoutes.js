'use strict';
module.exports = function(app) {
  const user = require('../controllers/userController');

  // todoList Routes
  app.route('/api/user')
      .get(user.listUsers)
      .post(user.signup);

  app.route('/api/user/:userId')
      .get(user.getUser)
      .post(user.updateUser)
      .delete(user.deleteUser);
};
