const router = require('express').Router();
const authController = require('../controllers/authController');
const verify = require('../middleware/authMiddleware');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get Current User (Protected)
router.get('/me', verify, authController.getCurrentUser);

module.exports = router;
