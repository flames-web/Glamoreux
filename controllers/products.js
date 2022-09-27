const Product = require('../models/product');
const Category = require('../models/category');
const Review = require('../models/review');


module.exports.renderProducts  = async (req,res) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const cats = await Category.find({}).populate('products')
    const count = await Product.count();
    res.render('categories/product',{pagename:'Glamoreux | Products',products,cats,pages: Math.ceil(count / perPage),home: "/product/?",current: page,url:req.originalUrl})
}

module.exports.renderSingleProduct = async (req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id).populate('reviews').populate('category')
    const cats = await Category.find({});
    res.render('categories/singleProduct',{product,pagename:`Glamoreux | ${product.name}`,cats,url:req.originalUrl})
}

module.exports.renderSingleCat = async (req,res) => {
    const {name} = req.params;
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({category:name}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const cats = await Category.find({}).populate('products')
    const cat = await Category.findById({_id:name});
    const count = await Product.count();
    res.render('categories/product',{pagename:`Glamoreux | ${cat.category}`,products,cats,pages: Math.ceil(count / perPage),home: `/product/category/${name}/?`,current: page,url:req.originalUrl})  
}
