const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/orders', ordersRoutes);

// MongoDB Connection
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env file');
} else {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('✅ Connected to MongoDB successfully!'))
      .catch((err) => console.error('❌ MongoDB connection error:', err));
}

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Cyber Spice Cafe Backend is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
