const User = require('../models/user');
const Token = require('../models/token');
const {sendMail} = require('../utils/email');

module.exports.getAccounts = async (req,res) => {
    const users = await User.find({});
    res.render('admin/account',{pagename:'Accounts',users});
}

module.exports.renderRegister = (req,res) => {
    res.render('users/register',{pagename:'Register'});
}

module.exports.register =  async (req,res,next) => {
    try{
        const {username , password , email} = req.body;
        const user = await  new User({username, email});
        const registeredUser = await User.register(user,password); 
      req.login(registeredUser,err => {
       if(err) return next(err)
      })
       req.flash('success','Welcome to hexashop');
      res.redirect('/')
        await sendMail({
          to,
          subject,
          text,
          html,
         })
      } catch (e){
        req.flash('error', e.message)
         res.redirect('/');
      } 
}


module.exports.renderLogin = (req,res) => {
    if (req.query.returnTo) {
        req.session.returnTo = req.query.returnTo;
    }
    res.render('users/login',{pagename:'Login'})
}

module.exports.login = (req,res) => {
    req.flash('success','Welcome back') 
    const redirectUrl = res.locals.returnTo || '/';
    res.redirect(redirectUrl);      
}

module.exports.userProfile = (req,res) => {
  res.render('users/profile')
}

module.exports.logout =  (req,res,next) => {
   req.logout(e => {
   if (e) return next(e)     
   req.flash('success', 'Goodbye')
   res.redirect('/')
   });
}