require("dotenv").config();
// const port = 3000;
const express = require("express");
const app = express();
const PORT = process.env.APP_PORT || 4000;
app.use(express.json());
const fs = require("fs");

// const path = require('path');
// app.use(express.static(path.join(__dirname,"./viwes")));
// app.post(express.urlencoded({extended:false}))
// const crypto = require("crypto");





require("./route/router")(app);

const server = app.listen(PORT, () =>
  console.log(`Example app listening on port !`, PORT)
);

// Increase timeouts to accommodate slow/fragmented sends from GSM/cellular modems
server.requestTimeout = 300000;   // 5 min — max time to receive full request
server.headersTimeout = 300000;   // 5 min — max time to receive headers
server.timeout = 300000;          // overall socket inactivity timeout
server.keepAliveTimeout = 65000;  // slightly above default, helps slow/keep-alive clients