const Product = require('../models/product');
const Category = require('../models/category');
const {cloudinary} = require('../cloudinary');
const nodemailer = require('nodemailer');
const {google} = require('googleapis')


module.exports.index = async (req,res) => {
    const products = await Product.find({});  
    res.render('admin/index',{products,pagename:'Admin'});
}

module.exports.contact = async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const products = await Product.find({});
    return res.render('categories/contact',{pagename:'Contact',cats,url:req.originalUrl});  
}

module.exports.postContact = async (req,res ) => {
    const {name,email,message} = req.body;
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
      console.log(accessToken);
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
        from: 'glamoreux0@gmail.com',
        to:'dexnis30@gmail.com',
        subject: name,
        text:message,
        html:`<h1>${message}</h1>`,
    }    

    const result = await transport.sendMail(mailOptions);

    return result;
   } catch (error) {
     return error;
   }
}

sendMail()
.then((result) => console.log('Email sent...', result,))
.catch((error) => console.log(error.message));
req.flash('success','We have sucessfully recieved your mail');
 res.redirect('/');
}

module.exports.about = async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const products = await Product.find({});
    for(let p of products){
        return res.render('categories/about',{pagename:'About',cats,url:req.originalUrl,product:p});
      }
}

module.exports.products =  async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const count = await Product.count();
    res.render('admin/products',{pagename:'Products',cats,products,pages: Math.ceil(count / perPage),home: "/admin/products/?",current: page,title:'All'})
}

module.exports.newProduct =  async (req,res) => {
    const cats = await Category.find({});
    res.render('admin/addProduct',{pagename:'Product',cats});
}

module.exports.createProduct =  async (req,res) => {
    let {name,description,category,price,images,unit} = req.body;
    let cat = await Category.findOne({category});
    category = cat._id;
    const product = new Product({name,description,price,unit,category,images});
    product.admin = req.user._id;
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await product.save();
    cat.products.push(product);
    await cat.save();
    req.flash('success','Sucessfully created a new product');
    res.redirect('/admin/products');
}

// module.exports.showProduct =  async (req,res) => {
//     const {id} = req.params;
//     const product = await Product.findById(id);
//     const cats = await Category.find({}).populate('products');
//     res.render('categories/singleProduct',{product,cats})
// }

module.exports.deleteProduct = async (req,res) => {
    if(req.body.delete){
        await Product.deleteMany({_id :req.body.delete });
        req.flash('error','sucessfully deleted a new product')
    }
    res.redirect('/admin/products')
}


module.exports.renderEditProduct = async (req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('admin/editProduct',{pagename:'Edit Product',product});
}

module.exports.updateProducts =  async (req,res) => {
    const {id} = req.params;
    const product = await Product.findByIdAndUpdate(id,req.body);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    await product.save();
    console.log(product);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    res.redirect('/');
}

module.exports.newCategory =  async (req,res) => {
    res.render('admin/addCategory',{pagename:'New Category'})
}

module.exports.createCategory = async (req,res) => {
    const cat = new Category(req.body);
    await cat.save();
    res.redirect('/admin/products');
}

module.exports.getCategory = async (req,res) => {
    res.render('admin/products',{pagename:'Pro'});
}

module.exports.showCategory =  async (req,res) => {
    const {name} = req.params;
    const cats = await Category.find({}).populate('products')
    const cat = await Category.find({_id:name}).populate('products')
    const perPage = 8;
    let page = parseInt(req.query.page) || 1
    const products = await Product.find({category:name}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const count = await Product.count();
    const pages = Math.ceil(count / perPage);
    const title = cat[0].category;
    res.render('admin/products',{cats,products,pages,home: `/admin/category/${name}/?`,current: page,title,url:req.originalUrl,pagename:`${cat.category}`});
}

module.exports.deleteCategory =  async (req,res) => {
    if(req.body.cool){
    const deleted  = await Category.deleteMany({_id :req.body.cool });
    const product = await Product.deleteMany({category:req.body.cool});
        console.log(product)
        req.flash('error','sucessfully deleted a new category')
    }
    res.redirect('/admin/products')
}