const Cart = require('../models/cart');
const Product = require('../models/product');
const Category = require('../models/category');
const request = require('request');
const _ = require('lodash');
const {initializePayment,veriryPayment} = require('../utils/payment')(request);

module.exports.getAddcart = async (req,res) => {
    try {
        const {id} = req.params;
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
                productId: product._id,
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
        console.log(req.headers)
        res.redirect('/')
    } catch (error) {
        console.log(error)
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
        }
        if(req.user && cartUser){
            req.session.cart = cartUser;
            return res.render('categories/shoppingCart',{pagename:`Glamoreux | Shopping Cart`,cart:cartUser,products: await productsFromCart(cartUser),cats,url:req.originalUrl});
        }
        if(!req.session.cart){
            return res.render('categories/shoppingCart',{pagename:`Glamoreux | Shopping Cart`,cart:null,cats,products :null,url:req.originalUrl})
        }
        return res.render('categories/shoppingCart',{pagename:`Glamoreux | Shopping Cart`,cart:req.session.cart,products: await productsFromCart(req.session.cart),product:p,url:req.originalUrl});
    } catch (error) {
        console.log(error)
        res.redirect('/');
    }

}


module.exports.reduce = async (req,res) => {
    try {
        const {id} = req.params;
    let cart;
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
        res.redirect('/shoppingCart');
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
        res.redirect('/shoppingCart');
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
}

module.exports.checkout = async (req,res) => {
    const cats = await Category.find({});
    let cart;
    cart = await Cart.findById(req.session._id);
    function getData(data){
        return data
    }
    const form = _.pick(req.body,['amount','email','full_name']);
    form.metadata = {
        full_name : form.full_name
    }
    form.amount = 5000;
    form.email = 'customer@email.com'
    initializePayment(form, (error, body)=>{
        if(error){
         console.log(error)
    }
    console.log(getData(data));
})
    res.render('categories/checkout',{cats,cart,pagename:'Glamoreux | Checkout'})
}

module.exports.postCheckout = async (req,res) => {
    
}

const productsFromCart = async (cart) => {
    let products = []; 
    for (const item of cart.items) {
      let foundProduct = (
        await Product.findById(item.productId).populate("category")
      )
      foundProduct["qty"] = item.qty;
      foundProduct["totalPrice"] = item.price;
     products.push(foundProduct)
    }
    return products;
} 