const mongoose = require('mongoose');

// // schema du document representant un post
const postSchema = mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            trim: true,
            maxLength: 500
        },
        service:{
            type:String,
            required:true,
        },
        picture: {
            type: String,
        },
        video: {
            type: String,
        },
        position:{
            type:String,
            required:true,
        }
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('post',postSchema);