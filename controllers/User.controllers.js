const User = require("../models/User.models.js");
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require("../utlis/JwtTokens.js");
const { uploadCloudinary } = require("../utlis/Cloudinary.js");
const FollowModel = require("../models/Follow.models.js");
const { mongoose } = require("mongoose");
const cookieSetting = { httpOnly: true, secure: true }

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, userName, description } = req.body;

    const imageData = req.file.path || null

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
      .json({ message: 'User created successfully', user, success: true });

  } catch (error) {
    res.status(500)
      .json({ message: 'Error creating user', error: error.message });
  }
}
const userLogin = async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    if (!userEmail || !password) {
      return res.status(403)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.aggregate([
      {
        $match: {
          email: userEmail,
        }
      },
      {
        $project: {
          password: 1
        }
      }
    ])

    if (!user) {
      return res.status(401)
        .json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
      return res.status(401)
        .json({ message: 'Wrong email or password' });
    }
    const { _id, userName, email } = user

    const accessToken = generateAccessToken({ _id, userName, email })
    const refreshToken = generateRefreshToken({ _id, userName, email })

    if (!accessToken || !refreshToken) {
      return res.status(500)
        .json({ message: 'Internal server error' });
    }

    const updatedRefreshToken = await User.findByIdAndUpdate(user[0]._id, 
      { $set: { refreshToken: refreshToken } }, {
      returnOriginal: false,
      projection: {
        featuredImage: 1,
        _id: 0,
        userName: 1
      }
    })

    if (!updatedRefreshToken) {
      return res.status(500)
        .json({ message: 'Problem in updating refresh token' });
    }
    console.log(updatedRefreshToken);
    res.status(200)
      .cookie("access_token", accessToken, cookieSetting)
      .cookie("refresh_token", refreshToken, cookieSetting)
      .json({ accessToken, refreshToken, success: true, user: updatedRefreshToken });

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
      .json({ message: 'User logged out successfully', success: true });
  } catch (error) {
    console.error('Error in user logout:', error);
    res.status(500)
      .json({ message: 'Internal server error' });
  }
}

const getUser = async (req, res) => {
  try {
    const { userName } = req.params
    const { _id: userId } = req.user
    if (!userName || !userId) {
      return res.status(400)
        .json({ message: 'User name is required' });
    }
    const user = await User.aggregate([
      {
        $match: {
          userName: userName
        }
      },
      {
        $lookup: {
          from: "blogs",
          localField: "_id",
          foreignField: "owner",
          as: "blogs",
          pipeline: [
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "blog",
                as: "comments",
              }
            },
            {
              $addFields: {
                commentsCount: {
                  $size: {
                    $ifNull: ["$comments", 0]
                  }
                }
              }
            },
            {
              $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "blog",
                as: "likes",
              }
            },
            {
              $addFields: {
                likesCount: {
                  $size: {
                    $ifNull: ["$likes", 0]
                  }
                }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "channel",
          as: "followers"
        }
      },
      {
        $addFields: {
          followersCount: {
            $size: {
              $ifNull: ["$followers", 0]
            }
          },
          isFollowed: {
            $cond: {
              if: {
                $in: [new mongoose.Types.ObjectId(userId), "$followers.user"]
              },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          userName: 1,
          fullName: 1,
          description: 1,
          featuredImage: 1,
          createdAt: 1,
          _id: 0,
          "blogs._id": 1,
          "blogs.title": 1,
          "blogs.content": 1,
          "blogs.featuredImage.public_id": 1,
          "blogs.commentsCount": 1,
          "blogs.likesCount": 1,
          followersCount: 1,
          isFollowed: 1
        }
      }
    ])
    if (!user.length) {
      return res.status(400)
        .json({ message: 'User not found' });
    }
    return res.status(200)
      .json({ data: user[0], success: true });

  } catch (err) {
    console.log(err.message)
    return res.status(500)
      .json({ message: 'Internal server error', success: false });
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
      .json({ message: 'User followed successfully', success: true });

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
      .json({ message: 'User unfollowed successfully', success: true });
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
  unfollowChannel,
  getUser
}