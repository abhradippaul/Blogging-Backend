const express = require('express');
const { userLogin } = require('../controllers/User.controllers');
const router = express.Router();

router.route("/login")
.post(userLogin)

module.exports = router