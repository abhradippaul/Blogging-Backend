const express = require("express")
const { createBlog, updateBlog, deleteBlog } = require("../controllers/Blog.controllers.js")
const { upload } = require("../middlewares/multer.middlewares.js")
const router = express.Router()

router.route("/v1")
    .post(upload.single("imageData"), createBlog)

router.route("/v1/:id").put(updateBlog).delete(deleteBlog)
router.route("/v1/getall").get()


module.exports = router