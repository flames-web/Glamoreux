const Product = require('../models/product');
const Review = require('../models/review');

module.exports.postReview = async (req,res) => {
    const {id,reviewId} = req.params;
    const product = await Product.findById(id).populate('reviews');
    const review = new Review(req.body);
    console.log(req.body)
    console.log(review)
    review.author = req.user._id;
    product.reviews.push(review);
    await review.save();
    await product.save();
    req.flash('success','Sucessfully created a new review');
    res.redirect(`/product/${product._id}`)
}

// module.exports.deleteReview = (req,res) => {
//   res.redirect('/home')
// }