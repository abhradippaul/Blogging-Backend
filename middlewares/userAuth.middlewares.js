const { verifyToken } = require("../utlis/JwtTokens");


const verifyAccessToken = (req, res, next) => {

    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not found' });
    }

    try {
        const value = verifyToken(accessToken)
        if (!value) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        req.user = value;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid access token' });
    }
};

module.exports = {
    verifyAccessToken
}
