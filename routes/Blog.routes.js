const express = require("express")
const { createBlog } = require("../controllers/Blog.controllers")
const router = express.Router()
router.route("/create")
.post(createBlog)

module.exports = router