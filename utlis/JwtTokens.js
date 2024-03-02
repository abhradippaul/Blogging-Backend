const jwt = require('jsonwebtoken');

const generateAccessToken = (_id) => {
    try {
        const payload = {
            _id
        };
        const options = {
            expiresIn: '15m', 
        };
        return jwt.sign(payload, secretKey, options);
    } catch (err) {
        console.log(err.message);
        return null
    }
}
const generateRefreshToken = (_id) => {
    try {
        const payload = {
            _id
        };
        const options = {
            expiresIn: '7d',
        };
        return jwt.sign(payload, secretKey, options);
    } catch (err) { 
        console.log(err.message);
        return null
    }
};
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (err) {
        console.log(err.message);
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};