var path = require('path');
var archive = require('../helpers/archive-helpers');
var utils = require('./http-helpers');
var url = require('url');


var actions = {
  'GET': function(request, response) {
    var urlPath = url.parse(request.url).pathname;
    if (urlPath === '/') {
      urlPath = '/index.html';
    }
    utils.serveAssets(response, urlPath, function() {
      // check urlPath
      if (urlPath[0] === '/') {
        // turn /www.google.com into www.google.com
        urlPath = urlPath.slice(1);
        archive.isUrlInList(urlPath, function (found) {
          if (found) {
            // redirect to loading page
            utils.redirect(response, '/loading.html');
          } else {
            utils.send404(response);
          }
        });
      }
    });
  },

  'POST': function(request, response) {
    utils.collectData(request, function(data) {
      // is data in urlList?
      // data is obj {url: website} -> 'url=website'
      var url = data.split('=')[1].replace('http://', '');
      archive.isUrlInList(url, function(matched) {
        if (matched) {
          archive.isUrlArchived(url, function(found) {
            if (found) {
              // redirect to page
              utils.redirect(response, '/' + url);
            } else {
              // redirect to loading page
              utils.redirect(response, '/loading.html');
            }
          });
        } else {
          archive.addUrlToList(url, function() {
            utils.redirect(response, '/loading.html');
          });
        }
      });
    // if found
      // is data in in archive?
      // if in archive
      // serve up web page using serveAssets
      // else
      // serve up loading page
    // if not found
      // add to url list
      // redirect to loading page
    });
  }
};

exports.handleRequest = function(request, response) {
  var action = actions[request.method];
  if (action) {
    action(request, response);
  } else {
    //send 404 response
    utils.send404(response);
  }
};
