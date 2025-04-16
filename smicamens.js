// Load node packages.
const express = require("express"),
    dns = require('dns'),
    fs = require('fs'),
    https = require('https'),
    http = require('http');


dns.setDefaultResultOrder('ipv4first');
const TLSoptions = {
    key: fs.readFileSync('../shared/localhost-key.pem'),
    cert: fs.readFileSync('../shared/localhost.pem'),
  };

// Initiate Express
let app = express();
app.use(express.json());

const rTask = require("./models/task");
const rAuth = require("./models/auth");
const {router: activityRouter}  = require("./models/activity");

app.use('/activity', activityRouter);
app.use('/task', rTask);
app.use('/auth', rAuth);

https.createServer(TLSoptions, app).listen(443, () => {
    console.log('Starting sMicamens at https://localhost:443');
  })

// Redirect HTTP to HTTPS
http.createServer((req, res) => {
    const host = req.headers.host;
    const redirectUrl = `https://${host}${req.url}`;
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  }).listen(80, () => {
    console.log('http://services.intife redirecting to HTTPS on port 80');
  });
