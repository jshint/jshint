"use strict";

var path = require("path");
var phantom = require("phantom");
var createTestServer = require("./helpers/browser/server");

var port = process.env.NODE_PORT || 8045;

var _ph, _page, _outObj;
createTestServer(port, function(server) {
  var shutdown = function() {
    _page.close();
    _ph.exit();
    server.close();
  };

  phantom.create(['--web-security=no']).then(function(ph) {
    _ph = ph;
    return _ph.createPage();
  }).then(function(page) {
    _page = page;
    _page.on('onConsoleMessage', function(message) {
      console.log(message);
    });
    _page.on('onCallback', function(message) {
      console.log(message);
    });
    _page.on('onError', function(message, trace) {
      console.error(message);
      console.error(trace);
      throw error;
    });
    return _page.open('http://localhost:' + port);
  }).then(shutdown, function(error) {
    shutdown();
    console.error(error);
    process.exit(1);
  })
});
