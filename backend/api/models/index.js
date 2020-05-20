const fs = require('fs');

// Loads all the models into mongoose
module.exports = function() {
  // read through files located in the current directory, i.e. api/routes
  fs.readdirSync(__dirname).forEach(function(file) {
    // skip this file
    if (file === 'index.js') {
      return;
    }

    // skip test files
    if (file.endsWith('.test.js')) {
      return;
    }

    // extract file name without `.js` file extension
    const name = file.substr(0, file.indexOf('.'));
    // import the router
    require('./' + name);
  });
};
