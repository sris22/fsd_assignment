const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    try {
        const token = req.header('auth-token');
        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Populate user data
        const user = await User.findById(verified._id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
