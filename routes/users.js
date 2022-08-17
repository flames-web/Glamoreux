const express = require('express');
const router = express.Router();
const User =  require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,checkReturnTo} = require('../middleware');
const users = require('../controllers/users');

router.get('/account',isLoggedIn,users.getAccounts);

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(checkReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)

router.get('/logout', users.logout)

module.exports = router;