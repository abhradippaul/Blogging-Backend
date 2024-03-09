const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userName : {
        type: String,
        required: true,
        unique: true
    },
    featuredImage : {
        url : {
            type : String,
            required : true
        },
        public_id : {
            type : String,
            required : true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
