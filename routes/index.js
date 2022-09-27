const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const User = require('../models/user');


router.get('/', async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const cools = await Product.find({});
    const products = await Product.find({});
    const images = ['/images/baner-right-image-01.jpg','/images/baner-right-image-02.jpg','/images/baner-right-image-03.jpg','/images/baner-right-image-04.jpg']
    return res.render('home',{pagename:'Glamoreux',cats,url:req.originalUrl,images,products,cools})
})

router.get("/search", async (req, res) => {
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
      console.log(error.message)
      res.redirect("/");
    }
  });
  

module.exports = router;