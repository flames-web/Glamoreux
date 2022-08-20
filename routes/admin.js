const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const admin = require('../controllers/admin');
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,validateProduct,validateCategory,isAdmin} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.get('/',isLoggedIn,isAdmin,catchAsync(admin.index));

router.get('/contact',catchAsync(admin.contact))

router.get('/about', catchAsync(admin.about))
 
router.route('/products')
    .get(isLoggedIn,isAdmin,catchAsync(admin.products))
    .post(isLoggedIn,isAdmin,upload.array('image'),validateProduct,catchAsync(admin.createProduct))
    .delete(isLoggedIn,isAdmin,catchAsync(admin.deleteProduct))


router.get('/products/new',isAdmin,isLoggedIn,isAdmin,catchAsync(admin.newProduct))

router.route('/products/:id')
    // .get(isLoggedIn,isAdmin,catchAsync(admin.showProduct))
    .put(isLoggedIn,isAdmin,upload.array('image'),validateProduct,catchAsync(admin.updateProducts))


router.get('/products/:id/edit',isLoggedIn,isAdmin,catchAsync(admin.renderEditProduct))

router.get('/category/new',isLoggedIn,isAdmin,catchAsync(admin.newCategory))

// router.get('/category',catchAsync(admin.getCategory));

router.post('/category',isLoggedIn,isAdmin,validateCategory,catchAsync(admin.createCategory))

router.get('/category/:name',isLoggedIn,isAdmin,catchAsync(admin.showCategory))

router.delete('/category',isLoggedIn,isAdmin,catchAsync(admin.deleteCategory))

module.exports = router;