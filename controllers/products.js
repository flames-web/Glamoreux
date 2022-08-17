const Product = require('../models/product');
const Category = require('../models/category');
const Review = require('../models/review');

module.exports.renderProducts  = async (req,res) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const cats = await Category.find({}).populate('products')
    const count = await Product.count();
    const cools = await Product.find({});
    for(let p of products){
        return res.render('categories/product',{products,cats,product:p,pages: Math.ceil(count / perPage),home: "/product/?",current: page,url:req.originalUrl})
   }
}

module.exports.renderSingleProduct = async (req,res) => {
    const {id} = req.params;
    const product = await Product.findById(id).populate('reviews')
    const cats = await Category.find({});
    res.render('categories/singleProduct',{product,cats,url:req.originalUrl})
}

module.exports.renderSingleCat = async (req,res) => {
    const {name} = req.params;
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({category:name}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const cats = await Category.find({}).populate('products')
    const count = await Product.count();
    for(let p of products){
            return  res.render('categories/product',{products,product:p,cats,pages: Math.ceil(count / perPage),home: `/product/category/${name}/?`,current: page,url:req.originalUrl})  
      }
}