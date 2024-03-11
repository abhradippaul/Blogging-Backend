const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment : {
        type: String,
        required: true
    },
    blog : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment