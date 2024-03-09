const express = require("express")
const { createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs, updateBlogImage, blogLike } = require("../controllers/Blog.controllers.js")
const { upload } = require("../middlewares/multer.middlewares.js")
const { verifyAccessToken } = require("../middlewares/userAuth.middlewares.js")
const router = express.Router()

router.route("/")
    .post(verifyAccessToken,upload.single("imageData"), createBlog)
    .get(getAllBlogs)

router.route("/:id")
.put(verifyAccessToken,updateBlog)
.delete(verifyAccessToken,deleteBlog)
.get(verifyAccessToken,getBlog)

router.route("/:id/updateblogimage")
.put(verifyAccessToken,upload.single("imageData"),updateBlogImage)

router.route("/:id/like")
.post(verifyAccessToken,blogLike)
.delete(verifyAccessToken,blogLike)


module.exports = router