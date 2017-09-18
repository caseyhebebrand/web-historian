var path = require('path');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');

exports.headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/html'
};


exports.sendResponse = function(response, obj, status) {
  var status = status || 200;
  response.writeHead(status, exports.headers);
  response.end(obj);
};

exports.collectData = function(request, callback) {
  var data = '';
  request.on('data', (chunk) => {
    data += chunk;
  });
  request.on('end', () => {
    callback(data);
  });
};

exports.send404 = function(response) {
  exports.sendResponse(response, '404: Page not found.', 404);
};

exports.redirect = function(response, location, status) {
  var status = status || 302;
  response.writeHead(status, {Location: location});
  response.end();
};

exports.serveAssets = function(response, asset, callback) {
  var encoding = {encoding: 'utf8'};
  fs.readFile(archive.paths.siteAssets + asset, encoding, function(err, data) {
    // file does not exist in public path
    if (err) {
      // check if it exists in teh archives
      fs.readFile(archive.paths.archivedSites + asset, encoding, function(err, data) {
        if (err) {
          callback ? callback() : exports.send404();
        } else {
          exports.sendResponse(response, data);
        }
      });
    } else {
      exports.sendResponse(response, data);
    }
  });
};



// As you progress, keep thinking about what helper functions you can put here!
