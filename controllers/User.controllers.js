const statusList = require("../BackendStatus.js");
const User = require("../models/User.models.js");
const bcrypt = require('bcrypt');
const { generateAccessToken,generateRefreshToken } = require("../utlis/JwtTokens.js");
const cookieSetting = { httpOnly: true, secure: true }

const createUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400)
      .json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
      return res.status(400)
      .json({ message: 'User already exist' });
    }

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword
    });

    if (!user.fullName) {
      return res.status(500)
      .json({
        message: "Data not saved in mongodb"
      })
    }

    res.status(201)
    .json({ message: 'User created successfully', user });

  } catch (error) {
    res.status(500)
    .json({ message: 'Error creating user' , error: error.message});
  }
}
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403)
      .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401)
      .json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401)
      .json({ message: 'Wrong email or password' });
    }

    const accessToken = generateAccessToken(user._id,user.fullName)
    const refreshToken = generateRefreshToken(user._id,user.fullName)

    if (!accessToken || !refreshToken) {
      return res.status(500)
        .json({ message: 'Internal server error' });
    }

    res.status(200)
      .cookie("access_token", accessToken, cookieSetting)
      .cookie("refresh_token", refreshToken, cookieSetting)
      .json({ accessToken, refreshToken });

  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500)
    .json({ message: 'Internal server error' });
  }

}

const userLogout = (req, res) => {
  try {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.status(200)
    .json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error in user logout:', error);
    res.status(500)
    .json({ message: 'Internal server error' });
  }
}

module.exports = {
  createUser,
  userLogin,
  userLogout
}