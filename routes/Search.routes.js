const express = require("express")
const { searchUser } = require("../controllers/Search.controllers")
const router = express.Router()

router.route("/search/:searchInfo").get(searchUser)

module.exports = router