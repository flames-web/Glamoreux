require('dotenv').config();
const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cookiePasser = require('cookie-parser')
const passport = require('passport');
const passportLocal = require('passport-local');
const flash = require('connect-flash');
const Product = require('./models/product');
const Category = require('./models/category');
const productRoute = require('./routes/product');
const adminRoute = require('./routes/admin');
const usersRoute = require('./routes/users');
const reviewRoute = require('./routes/review');
const cartRoute = require('./routes/cart')
const methodOverride = require('method-override');
const AppError = require('./utils/AppError');
const User = require('./models/user');
const MongoStore = require('connect-mongo');
const catchAsync = require('./utils/catchAsync')


const app = express();

app.engine('ejs',ejsMate);

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'));

const dbUrl = 'mongodb://localhost:27017/commerce'
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open', () => {
  console.log('Database Opened');
})


app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));

app.use(cookiePasser());
const secret = process.env.SECRET;
const store = MongoStore.create({
  mongoUrl:dbUrl,
  secret,
touchAfter: 24 * 60 * 60,
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

app.use(session({
  store,
  name:'session',
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
      expires: Date.now() * 1000 * 60*60*24*7,
      maxAge: 1000 * 60*60*24*7,
      httpOnly: true,
  }
}))


app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());
app.use((req,res,next) => {
res.locals.currentUser = req.user;
res.locals.session = req.session;
res.locals.success = req.flash('success');
res.locals.error = req.flash('error')
res.locals.returnTo = req.originalUrl;
next();
});



app.get('/', async (req,res) => {
  const cats = await Category.find({}).populate('products');
  const products = await Product.find({});
  for(let p of products){
     return res.render('home',{pagename:'Glamoreux',cats,url:req.originalUrl,product:p})
  }
})

app.get('/search',catchAsync( async(req,res)=> {
  const cats = await Category.find({})
  const page = parseInt(req.query.page)
  const products = await Product.find(
      {$or:[
          {name:{'$regex':req.query.search}},
          {description:{'$regex':req.query.search}}
       ]})
       for(let p of products){
         return  res.render('categories/product',{pagename:'Products',products,product:p,cats,pages: null,home: `/product/?`,current: page,url:req.originalUrl})  
         }  
}))

app.use('/product',productRoute);
app.use('/admin',adminRoute);
app.use(usersRoute);
app.use(cartRoute);
app.use('/product/:id/reviews',reviewRoute);

// app.get("/search", async (req, res) => {
//   const cats = await Category.find({});
//   const perPage = 8;
//   let page = parseInt(req.query.page);
//   try {
//     const products = await Product.find(
//       {$or:[
//       {name: { $regex: req.query.search, $options: "i" }},
//       {description: { $regex: req.query.search, $options: "i" }}
//     ]})
//      .sort("-createdAt")
//       .skip(perPage * page - perPage)
//       .limit(perPage)
//       .populate("category")
//     const count = await Product.find(
//       {$or:[
//       {name: { $regex: req.query.search, $options: "i" }},
//       {description: { $regex: req.query.search, $options: "i" }}
//     ]})
//     for(let p of products){
//       return  res.render('categories/product',{pagename:'Products',products,product:p,cats,pages: Math.ceil(count / perPage),home: `/product/?`,current: page,url:req.originalUrl})  
// }  
//   } catch (error) {
//     console.log(error.message,error.stack);
//     res.redirect("/");
//   }
// });

app.all('*', (req,res,next) => {
  const error = new AppError(400,'Page Not Found');
  next(error);
})

app.use((err,req,res,next) => {
  const { status = 500 } =  AppError;
  if(!err.message) err.message = 'Oh something went wrong';
  res.status(status).render('error',{err});
})

app.listen(3000, () => {
    console.log('Listening at port 3000');
}) 