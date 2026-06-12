require('dotenv').config();
const app = require("./src/app");
const connectDb = require('./src/db/db');

const { createServer } = require("http");
const initSocketServer = require('./src/sockets/socket.server');
// const { Server } = require("socket.io");
const httpServer = createServer(app);

connectDb();
initSocketServer(httpServer);


httpServer.listen(3000,()=>{
    console.log("Server is listening on port 3000");
})