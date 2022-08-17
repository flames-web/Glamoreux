const mongoose = require('mongoose');
const {Schema} = mongoose;
const Product = require('./product');

const categorySchema = new Schema({
    category : {
        type:String,
        required:true,
    },
    products:[
        {
            type: Schema.Types.ObjectId,
            ref:'Product',
        }
    ],
    catDescription:{
        type:String,
    }
})

module.exports = mongoose.model('Category',categorySchema)

categorySchema.post('deleteMany', async (doc) => {
    if(doc){
        await Product.deleteMany({
            _id: {
                $in : doc.products
            }
        })
    }
})