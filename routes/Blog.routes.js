const express = require("express")
const { createBlog, updateBlog, deleteBlog, getBlog, getAllBlogs, updateBlogImage } = require("../controllers/Blog.controllers.js")
const { upload } = require("../middlewares/multer.middlewares.js")
const { verifyAccessToken } = require("../middlewares/userAuth.middlewares.js")
const { blogLike, createBlogComment, deleteBlogComment, deleteBlogLike, updateBlogComment } = require("../controllers/BlogInfo.controllers.js")
const router = express.Router()

// For creating a new blog
router.route("/")
    .post(upload.single("imageData"), verifyAccessToken, createBlog)
    .get(getAllBlogs)

// For updating a blog
router.route("/:slug")
    .patch(verifyAccessToken, updateBlog)
    .delete(verifyAccessToken, deleteBlog)
    .get(verifyAccessToken, getBlog)

// For updating blog image
router.route("/:id/updateblogimage")
    .put(verifyAccessToken, upload.single("imageData"), updateBlogImage)

// For give like the blog
router.route("/:id/like")
    .post(verifyAccessToken, blogLike)
    .delete(verifyAccessToken, deleteBlogLike)

// For creating a new comment
router.route("/:id/comment")
    .post(verifyAccessToken, createBlogComment)
    .patch(verifyAccessToken, updateBlogComment)
    .delete(verifyAccessToken, deleteBlogComment)



module.exports = router