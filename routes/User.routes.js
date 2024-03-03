const express = require('express');
const { userLogin, createUser, userLogout } = require('../controllers/User.controllers');
const router = express.Router();

router.route("/").post(createUser)
router.route("/login")
    .post(userLogin)
router.route("/logout")
    .post(userLogout)

module.exports = router