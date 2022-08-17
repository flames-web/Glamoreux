const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const products = require('../controllers/products');
const catchAsync = require('../utils/catchAsync');

router.get('/',catchAsync(products.renderProducts));

router.get('/category/:name', catchAsync(products.renderSingleCat))

router.get('/:id',catchAsync(products.renderSingleProduct));




module.exports = router;