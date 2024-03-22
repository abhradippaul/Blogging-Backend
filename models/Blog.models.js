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
        public_id : {
            type : String,
            required : true
        }
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
},{timestamps : true});


const BlogPost = mongoose.model('Blog', blogPostSchema);

module.exports = BlogPost;
