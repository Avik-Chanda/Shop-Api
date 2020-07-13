// http package will provide some feature to spin up the server 
const http = require('http');
const app = require('./app');

//get the portt from environment variables
const port = process.env.PORT || 3000; 

const server = http.createServer(app);

server.listen(port);


