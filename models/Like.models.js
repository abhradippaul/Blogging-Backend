const mongoose = require('mongoose')

const likeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }
})
const Like = mongoose.model("Like", likeSchema)

module.exports = Like