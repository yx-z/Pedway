'use strict';
module.exports = function(app) {
  const sectionController = require('../controllers/sectionController');

  app.route('/api/pedway/section')
      .get(sectionController.getAll)
      .post(sectionController.create);

  app.route('/api/pedway/section/:sectionId')
      .get(sectionController.getById)
      .post(sectionController.update);
};
