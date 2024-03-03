const express = require("express")
const { createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs } = require("../controllers/Blog.controllers.js")
const { upload } = require("../middlewares/multer.middlewares.js")
const { verifyAccessToken } = require("../middlewares/userAuth.middlewares.js")
const router = express.Router()

router.route("/v1")
    .post(verifyAccessToken,upload.single("imageData"), createBlog)
    .get(getAllBlogs)

router.route("/v1/:id")
.put(verifyAccessToken,updateBlog)
.delete(verifyAccessToken,deleteBlog)
.get(verifyAccessToken,getBlog)


module.exports = router