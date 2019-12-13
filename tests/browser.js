"use strict";

const puppeteer = require('puppeteer');
var createTestServer = require("./helpers/browser/server");
var port = process.env.NODE_PORT || 8045;
const browser = puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
        const page = await browser.newPage();
        createTestServer(port, function(server) {
        page.on('console', msg => console.log("", msg.text()));
        page.exposeFunction('callChrome', text=> {
                browser.close();
                process.exit();
        });

        page.on("onError", function(msg, trace) {
          console.error(msg);
          console.error(trace);
          process.exit();
        });
        return page.goto("http://localhost:" + port, {
                        waitUntil: 'load'
        });
      });
});
