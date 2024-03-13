const mongoose = require('mongoose')

const followSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }
})

const FollowModel = mongoose.model("Follow",followSchema)

module.exports = FollowModel