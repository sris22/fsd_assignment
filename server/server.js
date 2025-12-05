const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.send('buddyyAI Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Gemini API Key loaded:', !!process.env.GEMINI_API_KEY);
});
