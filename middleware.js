const Product = require('./models/product');
const User = require('./models/user');
const Category = require('./models/category');
const {categorySchema,productSchema} = require('./schemas');
const AppError = require('./utils/AppError');


module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.returnTo = (req,res,next) => {
    req.session.save();
    next();
}

module.exports.validateCategory = (req,res,next) => {
    const {error} = categorySchema.validate(req.body);
    if(error){
     const msg = error.details.map(el => el.message).join(',');
      throw new AppError(400,msg);
    } else{
        next();
    }
}


module.exports.validateProduct = (req,res,next) => {
    const {error} = productSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(400,msg);
    }else{
        next();
    }
}


module.exports.checkReturnTo = (req,res,next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAdmin = async(req,res,next) => {
    const user = await User.findById(req.user._id);
        if(user.isAdmin === false){
            req.flash('error', 'You do not have access to do this');
            return res.redirect(`/`);
        }
   next();
}