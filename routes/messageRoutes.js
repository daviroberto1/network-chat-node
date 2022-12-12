const express = require('express');
const router = express.Router()

const MessageController = require('../controllers/MessageController')

router.get('/',MessageController.showMessages)
router.post('/messagePost',MessageController.messagePost)

module.exports = router