/** @module app */

require('dotenv').config();
const express = require('express');
// Load mongoose models into mongoose
require('../api/models')();
const bodyParser = require('body-parser');
const app = express();

const dbdisconnect = require('./databaseConnector')();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Parses cookies for easier handling
const cookieParser = require('cookie-parser');
app.use(cookieParser());

require('../api/routes')(app); // register routes

// Serves static files from frontend directory
app.use(express.static('./frontend'));

// 404 function
app.use(function(req, res) {
  res.status(404);

  // html page
  if (req.accepts('html')) {
    res.sendFile('frontend/404.html', {root: __dirname + '/..'});
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({error: 'Not found'});
    return;
  }

  // return plain text by default
  res.type('txt').send('Not found');
});

/**
 * @description disconnects any connections the app maintains
 */
function disconnect() {
  dbdisconnect();
}

/**
 * @description returns the app object and the
 *    disconnect function, which closes any active connections
 */
module.exports = {
  app: app,
  disconnect: disconnect,
};
