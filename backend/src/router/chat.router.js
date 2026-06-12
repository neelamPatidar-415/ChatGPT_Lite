const express = require('express');
const chatController = require('../controller/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

/* POST /api/chat/ */ // and this is protected route so use middleware 
router.post('/',authMiddleware,chatController);

module.exports = router;