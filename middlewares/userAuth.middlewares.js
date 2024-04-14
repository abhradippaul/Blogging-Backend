const { verifyToken } = require("../utlis/JwtTokens");


const verifyAccessToken = (req, res, next) => {
    let accessToken = req.cookies?.access_token || null
    if(!accessToken) {
        accessToken = req.headers.authkey || null
        if(accessToken) {
	accessToken = JSON.parse(accessToken).access_Token
        }
    }
    
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
