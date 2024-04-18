const express = require('express');
const { userLogin, createUser, userLogout, followChannel, unfollowChannel, getUser, getFollowing } = require('../controllers/User.controllers');
const { upload } = require('../middlewares/multer.middlewares');
const { verifyAccessToken } = require('../middlewares/userAuth.middlewares');
const router = express.Router();

router.route("/create")
    .post(upload.single("imageData"), createUser)

router.route("/login")
    .post(userLogin)

router.route("/logout")
    .post(userLogout)

router.route("/:userName")
    .get(verifyAccessToken, getUser)

router.route("/following/sidebar").get(verifyAccessToken, getFollowing)

router.route("/:channelId/follow")
    .post(verifyAccessToken, followChannel)
    .delete(verifyAccessToken, unfollowChannel)


module.exports = router