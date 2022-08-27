const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const catchAsync = require('../utils/catchAsync');
const reset = require('../controllers/passwordReset');

router.route('/reset')
    .get(catchAsync(reset.getReset))
    .post(catchAsync(reset.postReset))


router.route('/reset/:id/:tokenId')
    .get(catchAsync(reset.getToken))
    .post(catchAsync(reset.postToken))


module.exports = router;