const router = require('express').Router();
const chatController = require('../controllers/chatController');
const verify = require('../middleware/authMiddleware');

// Create new chat session
router.post('/sessions', verify, chatController.createChatSession);

// Get all chat sessions for user
router.get('/sessions', verify, chatController.getAllChatSessions);

// Get single chat session
router.get('/sessions/:sessionId', verify, chatController.getChatSession);

// Update chat session (title)
router.put('/sessions/:sessionId', verify, chatController.updateChatSession);

// Delete chat session
router.delete('/sessions/:sessionId', verify, chatController.deleteChatSession);

// Send message to chat session
router.post('/message', verify, chatController.sendMessage);

// Get user stats
router.get('/stats', verify, chatController.getUserStats);

module.exports = router;
