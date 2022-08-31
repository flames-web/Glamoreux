const User = require('../models/user');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
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
      console.log(link);
  
      const CLIENT_ID = process.env.CLIENT_ID;
      const CLEINT_SECRET = process.env.CLEINT_SECRET;
      const REDIRECT_URI = process.env.REDIRECT_URI;
      const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
      
  const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
  async function sendMail() {
  try {
  const accessToken = await oAuth2Client.getAccessToken();
  
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'glamoreux0@gmail.com',
      clientId: CLIENT_ID,
      clientSecret: CLEINT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  
  const mailOptions = {
    from: 'Glamoreux <yours authorised email glamoreux0@gmail.com>',
    to: email,
    subject: 'Password Reset',
    text: link,
    html: `<a href="${link}">${link}</a>`,
  };
  
  const result = await transport.sendMail(mailOptions);
  return result;
  } catch (error) {
  return error;
  }
  }
  sendMail()
  .then((result) => console.log('Email sent...', result,))
  .catch((error) => console.log(error.message))
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