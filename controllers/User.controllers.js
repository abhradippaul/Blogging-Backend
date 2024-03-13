const User = require("../models/User.models.js");
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require("../utlis/JwtTokens.js");
const { uploadCloudinary } = require("../utlis/Cloudinary.js");
const FollowModel = require("../models/Follow.models.js");
const cookieSetting = { httpOnly: true, secure: true }
const optimize_url = process.env.OPTIMIZE_URL

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, userName, description } = req.body;

    const imageData = req.file.path || null
    // console.log(imageData);

    if (!fullName || !email || !password || !userName) {
      return res.status(400)
        .json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isUserExist = await User.findOne({
      $or: [{ email }, { userName }]
    })

    if (isUserExist) {
      return res.status(400)
        .json({ message: 'User already exist' });
    }

    const cloudinaryResponse = await uploadCloudinary(imageData, "blog_folder/user")

    if (!cloudinaryResponse.public_id) {
      return res.status(400)
        .json({ message: "Cloudinary upload went wrong" })
    }

    const user = await User.create({
      fullName,
      email,
      userName,
      description,
      password: hashedPassword,
      featuredImage: {
        url: optimize_url.concat(cloudinaryResponse.public_id),
        public_id: cloudinaryResponse.public_id
      }
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
      .json({ message: 'Error creating user', error: error.message });
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

    const accessToken = generateAccessToken(user._id, user.fullName)
    const refreshToken = generateRefreshToken(user._id, user.fullName)

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

const followChannel = async (req, res) => {
  try {
    const { _id: user } = req.user
    const { channelId } = req.params
    if (!channelId || !user) {
      return res.status(400)
        .json({ message: 'Channel and user are required' });
    }
    const follow = await FollowModel.create({
      user: user,
      channel: channelId
    })
    if (!follow) {
      return res.status(400)
        .json({ message: 'Mongodb error' });
    }
    return res.status(200)
      .json({ message: 'User followed successfully' });

  } catch (err) {
    return res.status(500)
      .json({ message: 'Internal server error' });
  }
}

const unfollowChannel = async (req, res) => {
  try {
    const { _id: user } = req.user
    const { channelId } = req.params
    if (!channelId || !user) {
      return res.status(400)
        .json({ message: 'Channel and user are required' });
    }
    const follow = await FollowModel.findOneAndDelete({
      user: user,
      channel: channelId
    })
    if (!follow) {
      return res.status(400)
        .json({ message: 'Mongodb error' });
    }
    return res.status(200)
      .json({ message: 'User unfollowed successfully' });
  } catch (err) {
    return res.status(500)
      .json({ error: "Internal server error", message: err.message })
  }
}

module.exports = {
  createUser,
  userLogin,
  userLogout,
  followChannel,
  unfollowChannel
}