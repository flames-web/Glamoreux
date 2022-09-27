const User = require('../models/user');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const {sendMail} = require('../utils/email');
const Token = require('../models/token');
const crypto = require('crypto');




module.exports.getReset = async (req,res) => {
    res.render('users/passwordReset');
}

module.exports.postReset = async (req,res) => {
    const {email} = req.body; 
      const user = await User.findOne({ email });
       if (!user && !email){
         req.flash('error',"user with given email doesn't exist")}
         let token = await Token.findOne({ userId: user._id })
         if (!token) {
           token = await new Token({
            userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
          }).save();
      }
      const link = `${process.env.BASE_URL}/reset/${user._id}/${token.token}`;
      await sendMail({
        to,
        subject,
        text,
        html
      })
  req.flash('success','email sent sucessfully')
  res.render('categories/email');
}

module.exports.getToken = async (req,res) => {
    const {tokenId,id} = req.params;
    const token = await Token.findOne({tokenId});
    const user = await User.findById(id)
    res.render('users/newPassword',{token,user})
}

module.exports.postToken = async (req,res) => {
    const {id,tokenId} = req.params;
    const user = await User.findById(id)
    const token = await Token.findOne({tokenId})
    console.log(user)
    if(user && token){
      const {password,username} = req.body;
      User.findByUsername(username).then(function(sanitizedUser){
      if (sanitizedUser){
       sanitizedUser.setPassword(password, function(){
       sanitizedUser.save();
       req.flash('Success','password reset sucessfully')
      res.redirect('/login');
      })
      } else {
          req.flash('error','this user does not exist');
          res.redirect(req.originalUrl);
      }    
  })
      
    } else{
      req.flash('error','invalid link or expired');  
    }
}