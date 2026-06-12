const cookieParser = require('cookie-parser');
const express = require('express');
const AuthRouter = require('./router/auth.router');
const app = express();
const chatRouter = require('./router/chat.router');

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',AuthRouter);
app.use('/api/chat',chatRouter);

module.exports = app;