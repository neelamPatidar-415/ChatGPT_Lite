const express = require('express');
const controller = require('../controller/auth.controller');
const router = express.Router();
const Validation = require('../middleware/Validation.Middleware');

router.post('/register',Validation.registerUserValidations,controller.register);
router.post('/login',Validation.loginUserValidations,controller.login);
router.post('/logout',controller.logout);
router.get('/me', controller.checkAuth);

module.exports = router;