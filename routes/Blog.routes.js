const express = require("express")
const { createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs, updateBlogImage } = require("../controllers/Blog.controllers.js")
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


module.exports = router