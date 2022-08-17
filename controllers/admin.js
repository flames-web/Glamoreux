const Product = require('../models/product');
const Category = require('../models/category');
const {cloudinary} = require('../cloudinary');


module.exports.index = async (req,res) => {
    const products = await Product.find({});  
    res.render('admin/index',{products});
}

module.exports.contact = async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const products = await Product.find({});
    for(let p of products){
        return res.render('categories/contact',{cats,url:req.originalUrl,product:p});
      }  
}

module.exports.about = async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const products = await Product.find({});
    for(let p of products){
        return res.render('categories/about',{cats,url:req.originalUrl,product:p});
      }
}

module.exports.products =  async (req,res) => {
    const cats = await Category.find({}).populate('products');
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const products = await Product.find({}).sort("-createdAt").skip(perPage * page - perPage).limit(perPage)
    const count = await Product.count();
    res.render('admin/products',{cats,products,pages: Math.ceil(count / perPage),home: "/admin/products/?",current: page,title:'All'})
}

module.exports.newProduct =  async (req,res) => {
    const cats = await Category.find({});
    res.render('admin/addProduct',{cats});
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
    res.render('admin/editProduct',{product});
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
    res.render('admin/addCategory')
}

module.exports.createCategory = async (req,res) => {
    const cat = new Category(req.body);
    await cat.save();
    res.redirect('/admin/products');
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
    res.render('admin/products',{cats,products,pages,home: `/admin/category/${name}/?`,current: page,title,url:req.originalUrl});
}