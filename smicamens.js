// Load node packages.
let express = require("express");
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Initiate Express
let app = express();
app.use(express.json());

const rTask = require("./models/task");
const rAuth = require("./models/auth");
const {router: activityRouter}  = require("./models/activity");

app.use('/activity', activityRouter);
app.use('/task', rTask);
app.use('/auth', rAuth);

app.listen(3001, function() {
    console.log("Starting mMicamens");
});
