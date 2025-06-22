const mongoose = require('mongoose');

const CakeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
}, { versionKey: false });

module.exports = mongoose.model('Cake', CakeSchema);
