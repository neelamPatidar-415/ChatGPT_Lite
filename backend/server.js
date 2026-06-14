require('dotenv').config();
const app = require("./src/app");
const connectDb = require('./src/db/db');

const { createServer } = require("http");
const initSocketServer = require('./src/sockets/socket.server');
// const { Server } = require("socket.io");
const httpServer = createServer(app);

connectDb();
initSocketServer(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
});

httpServer.on('error', (err) => {
    console.error('Server error:', err);
});