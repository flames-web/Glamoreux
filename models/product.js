const mongoose = require('mongoose');
const {Schema} = mongoose;
const Category = require('./category');


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

module.exports = mongoose.model('Product',new Schema ({
    name : {
        type:String,
        required : true
    },
    description: {
        type:String,

    },
    price:{
        type:Number,
        required:true,
    },
    unit:{
        type:Number,
        required:true,
    },
    images : [
        ImageSchema
    ],
    category :  {
        type: Schema.Types.ObjectId,
        ref:'Category',
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review',
        }
    ]

}));