const express = require('express');
const { userLogin, createUser, userLogout } = require('../controllers/User.controllers');
const { upload } = require('../middlewares/multer.middlewares');
const router = express.Router();

router.route("/create")
.post(upload.single("imageData"),createUser)

router.route("/login")
    .post(userLogin)
    
router.route("/logout")
    .post(userLogout)

module.exports = router