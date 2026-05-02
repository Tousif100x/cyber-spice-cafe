const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const SYSTEM_PROMPT = require('../prompt');
const Order = require('../models/Order');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_KEY.startsWith('sk-or') ? 'https://openrouter.ai/api/v1' : undefined
});

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Prepend system prompt
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_KEY.startsWith('sk-or') ? 'inclusionai/ling-2.6-1t:free' : 'gpt-4o-mini',
      messages: apiMessages,
      temperature: 0.7,
    });

    let botResponse = completion.choices[0].message.content;
    let orderFinalized = false;
    let savedOrder = null;

    // Check if the bot included the secret JSON block for a finalized order
    const jsonMatch = botResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[1]);
        if (parsedJson.FINALIZED_ORDER) {
          const orderData = parsedJson.FINALIZED_ORDER;
          
          // Save order to MongoDB
          const newOrder = new Order({
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            status: 'confirmed',
            customerDetails: {
              fulfillmentType: orderData.fulfillmentType,
              address: orderData.address,
              contactNumber: orderData.contact,
            }
          });
          
          savedOrder = await newOrder.save();
          orderFinalized = true;
          
          // Remove the secret JSON block from the response shown to the user
          botResponse = botResponse.replace(/```json\n[\s\S]*?\n```/, '').trim();
        }
      } catch (err) {
        console.error('Error parsing order JSON:', err);
      }
    }

    res.json({
      role: 'assistant',
      content: botResponse,
      orderFinalized,
      savedOrderId: savedOrder ? savedOrder._id : null
    });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;
