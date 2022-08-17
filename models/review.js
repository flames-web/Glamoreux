const mongoose = require('mongoose');
const {Schema} = mongoose;


module.exports = mongoose.model('Review', new Schema({
    message:{
        type:String,
        required:true,
    },
    rating:Number,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
}));