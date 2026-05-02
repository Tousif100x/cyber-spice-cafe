const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  customization: { type: String }
});

const OrderSchema = new mongoose.Schema({
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'confirmed' 
  },
  customerDetails: {
    fulfillmentType: { type: String, enum: ['Delivery', 'Pickup', 'Dine-In'] },
    contactName: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    notes: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
