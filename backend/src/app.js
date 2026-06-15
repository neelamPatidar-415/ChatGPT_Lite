const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const path = require('path');

const AuthRouter = require('./router/auth.router');
const app = express();
const chatRouter = require('./router/chat.router');

app.use(cors({
    origin: [ 'http://localhost:5173', 'http://localhost:5174' ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));


app.use('/api/auth',AuthRouter);
app.use('/api/chat',chatRouter);

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
