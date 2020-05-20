'use strict';
module.exports = function(app) {
  const feedback = require('../controllers/feedbackController');

  // todoList Routes
  app.route('/api/feedback')
      .get(feedback.listFeedback)
      .post(feedback.createFeedback);

  app.route('/api/feedback/:id')
      .get(feedback.readFeedback)
      .post(feedback.updateFeedback)
      .delete(feedback.deleteFeedback);
};
