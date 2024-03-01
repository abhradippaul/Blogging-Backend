const express = require("express")
const { createBlog } = require("../controllers/Blog.controllers.js")
const { upload } = require("../middlewares/multer.middlewares.js")
const router = express.Router()
router.route("/create")
.post(upload.single("imageData"),createBlog)

module.exports = router