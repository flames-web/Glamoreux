if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const session = require('express-session');
const cookiePasser = require('cookie-parser')
const passport = require('passport');
const passportLocal = require('passport-local');
const flash = require('connect-flash');
const stripe = require('stripe')(process.env.SECRET_KEY);
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const Product = require('./models/product');
const Category = require('./models/category');
const User = require('./models/user');

const AppError = require('./utils/AppError');
const catchAsync = require('./utils/catchAsync');

const productRoute = require('./routes/product');
const adminRoute = require('./routes/admin');
const usersRoute = require('./routes/users');
const reviewRoute = require('./routes/review');
const cartRoute = require('./routes/cart');
const resetRoute = require('./routes/passwordReset');


app.engine('ejs',ejsMate);

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));
app.use(mongoSanitize({
  replaceWith: '_'
}))

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'));

const dbUrl = 'mongodb://localhost:27017/commerce'
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open', () => {
  console.log('Database Opened');
})


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

app.use(helmet());

app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://kit.fontawesome.com",
    "https://ka-f.fontawesome.com",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
    "https://ka-f.fontawesome.com"
];
const connectSrcUrls = [
  "https://fonts.gstatic.com",
  "https://cdn.linearicons.com",
];
const fontSrcUrls = [
 
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcz8fqwkr/", 
                "https://images.unsplash.com",
                "https://cdn.pixabay.com/",
                "https://images.pexels.com",
                "https://live.staticflickr.com",
                "https://storage.needpix.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })),

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
  const cools = await Product.find({});
  const products = await Product.find({});
  const images = ['/images/baner-right-image-01.jpg','/images/baner-right-image-02.jpg','/images/baner-right-image-03.jpg','/images/baner-right-image-04.jpg']
  return res.render('home',{pagename:'Glamoreux',cats,url:req.originalUrl,images,products,cools})
})


app.use('/product',productRoute);
app.use('/admin',adminRoute);
app.use(usersRoute);
app.use(cartRoute);
app.use('/product/:id/reviews',reviewRoute);
app.use('/',resetRoute);

app.get("/search", async (req, res) => {
  const cats = await Category.find({});
  const cools = await Product.find({});
  const perPage = 8;
  let page = parseInt(req.query.page);
  try {
    const products = await Product.find(
      {$or:[
      {name: { $regex: req.query.search, $options: "i" }},
      {description: { $regex: req.query.search, $options: "i" }}
    ]})
     .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
    const count = await Product.find(
      {$or:[
      {name: { $regex: req.query.search, $options: "i" }},
      {description: { $regex: req.query.search, $options: "i" }}
    ]})
   
      return  res.render('categories/product',{pagename:'Products',products,cools,cats,
          pages: Math.ceil(count / perPage),home: `/product/?`,current: page,url:req.originalUrl})  

  } catch (error) {
    console.log(error.message,error.stack);
    res.redirect("/");
  }
});

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
    console.log(process.env.NODE_ENV)
}) 