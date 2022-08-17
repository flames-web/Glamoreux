 const mongoose = require('mongoose');
 const {Schema} = mongoose;
 const Product = require('../models/product');

module.exports = mongoose.model('Cart',new Schema({
  items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        qty: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
        name: {
          type: String,
        },
      },
    ],
    totalQty: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
}))