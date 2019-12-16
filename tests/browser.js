"use strict";

var puppeteer; 
try {
  puppeteer = require('puppeteer');
} catch (err) {	
  throw new Error(	
    "Unable to run tests in Chrome because the required dependencies are " +	
    "not available. Please note that JSHint does not support development " +	
    "using versions of Node.js which are no longer maintained."	
  );	
}
var createTestServer = require("./helpers/browser/server");
var port = process.env.NODE_PORT || 8045;
const browser = puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }).then(async browser => {
  const page = await browser.newPage();
  createTestServer(port, function(server) {
    page.on("console", msg => console.log("", msg.text()));

    page.exposeFunction("callChrome", text=> {
      browser.close();
      process.exit();
    });

    page.on('error', err=> {
      console.log('error: ', err);
    });

    return page.goto("http://localhost:" + port, {
      waitUntil: "load"
    });
  });
});
