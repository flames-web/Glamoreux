const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const cart = require('../controllers/cart');
const Cart = require('../models/cart');

router.get('/addCart/:id',catchAsync(cart.getAddcart));

router.get('/shoppingCart',catchAsync(cart.getShoppingCart));

router.get('/reduce/:id',catchAsync(cart.reduce));

router.get('/removeAll/:id',catchAsync(cart.removeAll))

router.get('/checkout',catchAsync(cart.checkout))

router.post('/checkout',catchAsync(cart.postCheckout))

module.exports = router; 