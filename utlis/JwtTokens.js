const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY

const generateAccessToken = ({_id,userName,email}) => {
    try {
        const payload = {
            _id,
            userName,
            email
        };
        // console.log(payload)
        const options = {
            expiresIn: '1d', 
        };
        return jwt.sign(payload, secretKey, options);
    } catch (err) {
        console.log(err.message);
        return null
    }
}
const generateRefreshToken = ({_id,userName,email}) => {
    try {
        const payload = {
            _id,
            userName,
            email
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