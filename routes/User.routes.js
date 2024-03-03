const express = require('express');
const { userLogin, createUser } = require('../controllers/User.controllers');
const router = express.Router();

router.route("/").post(createUser)
router.route("/login")
    .post(userLogin)

module.exports = router