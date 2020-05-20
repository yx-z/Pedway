const fs = require('fs');

// require this file to add all routers in the current directory
// instead of adding each of them manually
module.exports = function(app) {
  // read through files located in the current directory, i.e. api/routes
  fs.readdirSync(__dirname).forEach(function(file) {
    // skip this file
    if (file === 'index.js') {
      return;
    }

    // extract file name without `.js` part
    const name = file.substr(0, file.indexOf('.'));
    // import the router
    require('./' + name)(app);
  });
};
