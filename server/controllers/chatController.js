const ChatSession = require('../models/Chat');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Create New Chat Session
exports.createChatSession = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user._id;

        const newSession = new ChatSession({
            userId,
            title: title || 'New Chat',
            messages: [],
            isActive: true
        });

        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Chat Sessions for User
exports.getAllChatSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const sessions = await ChatSession.find({ userId })
            .sort({ updatedAt: -1 })
            .select('title messages isActive createdAt updatedAt');
        
        // Return summary with message count
        const sessionsSummary = sessions.map(session => ({
            _id: session._id,
            title: session.title,
            messageCount: session.messages.length,
            isActive: session.isActive,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            lastMessage: session.messages.length > 0 
                ? session.messages[session.messages.length - 1].content.substring(0, 50)
                : null
        }));

        res.json(sessionsSummary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Single Chat Session
exports.getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Chat Session Title
exports.updateChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title } = req.body;
        const userId = req.user._id;

        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        if (title) session.title = title;
        const updatedSession = await session.save();

        res.json(updatedSession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Chat Session
exports.deleteChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        await ChatSession.deleteOne({ _id: sessionId, userId });
        res.json({ message: 'Chat session deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send Message to Chat Session
exports.sendMessage = async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        const userId = req.user._id;

        // Get or create chat session
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
            if (!session) {
                return res.status(404).json({ message: 'Chat session not found' });
            }
        } else {
            // Create new session if no sessionId provided
            session = new ChatSession({
                userId,
                title: message.substring(0, 50) || 'New Chat',
                messages: [],
                isActive: true
            });
        }

        // Add user message
        session.messages.push({ role: 'user', content: message });

        // Call Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const history = session.messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chatSession = model.startChat({ history });
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Add AI response
        session.messages.push({ role: 'model', content: text });
        
        // Update title if it's the first message
        if (session.messages.length === 2 && session.title === 'New Chat') {
            session.title = message.substring(0, 50);
        }

        await session.save();

        res.json({
            reply: text,
            session: session,
            sessionId: session._id
        });
    } catch (err) {
        console.error("Chat API Error:", err);
        res.status(500).json({ error: err.message, details: err.toString() });
    }
};

// Get User Stats
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const totalSessions = await ChatSession.countDocuments({ userId });
        const activeSessions = await ChatSession.countDocuments({ userId, isActive: true });
        
        const allSessions = await ChatSession.find({ userId });
        const totalMessages = allSessions.reduce((sum, session) => sum + session.messages.length, 0);

        res.json({
            totalSessions,
            activeSessions,
            totalMessages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

