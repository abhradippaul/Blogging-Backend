const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featuredImage : {
        url : {
            type : String,
            required : true
        },
        asset_id : {
            type : String,
            required : true
        }
    },
    // owner: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User', // Assuming there's a User model
    //     required: true
    // }
},{timestamps : true});


const BlogPost = mongoose.model('blog', blogPostSchema);

module.exports = BlogPost;