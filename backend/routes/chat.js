const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const SYSTEM_PROMPT = require('../prompt');
const Order = require('../models/Order');

const apiKey = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: apiKey.startsWith('sk-or') ? 'https://openrouter.ai/api/v1' : undefined
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

    // Try a list of free models in order until one works
    const freeModels = [
      'deepseek/deepseek-chat-v3-0324:free',
      'google/gemma-3-4b-it:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'openrouter/free',
    ];
    const modelsToTry = apiKey.startsWith('sk-or') ? freeModels : ['gpt-4o-mini'];

    let completion = null;
    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        completion = await openai.chat.completions.create({
          model: modelName,
          messages: apiMessages,
          temperature: 0.7,
        });
        console.log(`✅ Model worked: ${modelName}`);
        break;
      } catch (err) {
        console.error(`❌ Model failed (${modelName}):`, err?.error?.message || err.message);
        lastError = err;
      }
    }
    if (!completion) throw lastError;

    // Some reasoning models return null content — fall back to reasoning_content or empty string
    const msg = completion.choices[0].message;
    let botResponse = msg.content || msg.reasoning_content || '';
    let orderFinalized = false;
    let savedOrder = null;

    // Check if the bot included the secret JSON block for a finalized order
    const jsonMatch = botResponse ? botResponse.match(/```json\n([\s\S]*?)\n```/) : null;
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
    res.status(500).json({ error: 'Failed to process chat message', detail: error?.error?.message || error.message });
  }
});

module.exports = router;
