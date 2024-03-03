const statusList = require("../BackendStatus.js");
const User = require("../models/User.models.js");
const bcrypt = require('bcrypt');
const { generateAccessToken,generateRefreshToken } = require("../utlis/JwtTokens.js");
const cookieSetting = { httpOnly: true, secure: true }

const createUser = async (req, res) => {
  try {

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword
    });
    if (!user.fullName) {
      return res.status(statusList.internalServerError.value).json({
        error: statusList.internalServerError.name,
        message: "Data not saved in mongodb"
      })
    }

    res.status(statusList.created.value).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(statusList.internalServerError.value).json({ error: 'Error creating user' });
  }
}
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(statusList.badRequest.value).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(statusList.notFound.value).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(statusList.unauthorized.value).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    if (!accessToken || !refreshToken) {
      return res.status(statusList.internalServerError.value)
        .json({ message: 'Internal server error' });
    }
    res.status(200)
      .cookie("access_token", accessToken, cookieSetting)
      .cookie("refresh_token", refreshToken, cookieSetting)
      .json({ accessToken, refreshToken });

  } catch (error) {
    console.error('Error in user login:', error);
    res.status(statusList.internalServerError.value).json({ message: 'Internal server error' });
  }

}

const userLogout = (req, res) => {
  try {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.status(statusList.statusOK.value).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error in user logout:', error);
    res.status(statusList.internalServerError.value).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createUser,
  userLogin,
  userLogout
}