const express = require('express');
const router = express.Router({mergeParams:true}); 
const review = require('../controllers/review');
const catchAsync = require('../utils/catchAsync');


router.post('/',catchAsync(review.postReview));

// router.delete('/product/:id/review',catchAsync(review.deleteReview));

module.exports = router;