var nconf = require('nconf');
var path = require('path');

var confFile = path.join(__dirname, 'config.json');

var config = nconf.env().file(confFile);

module.exports = config;