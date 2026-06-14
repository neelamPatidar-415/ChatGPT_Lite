const express = require('express');
const controller = require('../controller/auth.controller');
const router = express.Router();

router.post('/register',controller.register);
router.post('/login',controller.login);
router.post('/logout',controller.logout);
router.get('/me', controller.checkAuth);

module.exports = router;