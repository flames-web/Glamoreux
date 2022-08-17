const Cart = require('../models/cart');
const Product = require('../models/product');
const Category = require('../models/category');

module.exports.getAddcart = async (req,res) => {
    const {id} = req.params;
    try {
        let userCart;
        if(req.user){
            userCart = await Cart.findOne({user:req.user._id});
        }
        let cart;
        if((req.user && !userCart) || (!req.user && req.session.cart)){
            cart = await new Cart(req.session.cart);    
        }else if(!req.user || !userCart) {
            req.flash('error','You must sign in to perform this action')
            return res.redirect(`/login?returnTo=/product/${id}`);
        }else {
            cart = userCart;
            console.log(cart);
        }

        const product = await Product.findById(id);
        const itemIndex = cart.items.findIndex((p)=> p.productId == id);
        if(itemIndex > -1){
            cart.items[itemIndex].qty++;
            cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
            cart.totalQty++;
            cart.totalCost += product.price;
        }else {
            cart.items.push({
                productId: id,
                name:product.name,
                qty:1,
                price:product.price,
            });
            cart.totalQty++;
            cart.totalCost += product.price
        } 

        if(req.user){
            cart.user = req.user._id;
            await cart.save();
        }

        req.session.cart = cart;
        req.flash('success','Item added to the shopping cart');
        console.log(req.session)
        res.redirect(req.headers.referer)
    } catch (error) {
        console.log(error.message, error.stack);
        res.redirect("/");
    }
}

module.exports.getShoppingCart = async (req,res) => {
    const cats = await Category.find({});
    let products;
    try {
        let cartUser;
        if(req.user){
            cartUser = await Cart.findOne({user:req.user._id});
            console.log(cartUser);
        }
        const cool = await Product.find({});
        for(let p of cool){
        if(req.user && cartUser){
            req.session.cart = cartUser;
            return res.render('categories/shoppingCart',{cart:cartUser,products: await productsFromCart(cartUser),product:p,cats,url:req.originalUrl});
        }
        if(!req.session.cart){
            return res.render('categories/shoppingCart',{cart:null,cats,products :null,url:req.originalUrl,product:p})
        }
        return res.render('categories/shoppingCart',{cart:req.session.cart,products: await productsFromCart(req.session.cart),product:p,url:req.originalUrl});
    }} catch (error) {
        console.log(error.message);
        console.log(error.stack);
        res.redirect('/');
    }

}


module.exports.reduce = async (req,res) => {
    const {id} = req.params;
    let cart;
    try {
        if(req.user){
            cart = await Cart.findOne({user:req.user._id});
        }else if(req.session.cart){
            cart = await new Cart(req.session.cart)
        }

        let itemIndex = cart.items.findIndex((p) => p.productId == id)
        if(itemIndex > -1){
            const product = await Product.findById(id);
            cart.items[itemIndex].qty--;
            cart.items[itemIndex].price -= product.price;
            cart.totalQty--;
            cart.totalCost -= product.price;
            if(cart.items[itemIndex].qty <= 0){
                await cart.items.remove({_id:cart.items[itemIndex]._id});
            }
            req.session.cart = cart;
            if(req.user){
                await cart.save();
            }
            if(cart.totalQty <= 0){
                req.session.cart = null;
                await Cart.findByIdAndRemove(cart._id);
            }
        }
        req.flash('success','Sucessfully removed cart');
        res.redirect(req.headers.referer);
    } catch (error) {
        console.log(error.message);
        res.redirect('/');
    }
}

module.exports.removeAll = async (req,res) => {
    const {id} = req.params;
    let cart;
    try {
        if(req.user){
            cart = await Cart.findOne({user:req.user._id});
        }else if(req.session.cart){
            cart = await new Cart(req.session.cart);
        }

        const itemIndex = cart.items.findIndex((p) => p.productId == id)
        if(itemIndex > -1){
            cart.totalQty -= cart.items[itemIndex].qty;
            cart.totalCost -= cart.items[itemIndex].price;
            await cart.items.remove({_id:cart.items[itemIndex]._id});
        }
        req.session.cart = cart;
        if(req.user){
            await cart.save();
        }
        if(cart.totalQty <= 0){
            req.session.cart = null;
            await Cart.findByIdAndRemove(cart._id);
        }
        res.redirect(req.headers.referer);
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
}

module.exports.checkout = async (req,res) => {
    const cats = await Category.find({});
    let cart;
    const cool = await Product.find({});
    for(let p of cool){
    if(!req.session.cart){
        res.redirect('/shoppingCart')
    }
    cart = await Cart.findById(req.session._id);
    res.render('categories/checkout',{cats,cart,product:p})
}}

const  productsFromCart = async (cart) => {
    let products = []; 
    for (const item of cart.items) {
        console.log(item.productId)
      let foundProduct = (
        await Product.findById(item.productId).populate("category")
      )
      foundProduct["qty"] = item.qty;
      foundProduct["totalPrice"] = item.price;
     products.push(foundProduct)
    }
    return products;
  }