const Comment = require("../models/Comment.models");
const Like = require("../models/Like.models");

const blogLike = async (req, res) => {
    try {
        const { id: blogId } = req.params;
        const { _id: viewId } = req.user

        if (!blogId || !viewId) {
            return res.status(400)
                .json({ err: "Id is missing" });
        }
        const like = await Like.create({
            user: viewId,
            blog: blogId
        })

        if (!like) {
            return res.status(400)
                .json({ error: "Error in like" });
        }
        return res.status(200).json({
            message: "Success",
            data: like
        });

    } catch (err) {
        return res.status(500)
            .json({
                message: "Internal server error",
                error: err.message
            });
    }
}
const createBlogComment = async (req, res) => {
    try {
        const { id: blogId } = req.params;
        const { _id: viewId } = req.user
        const { comment } = req.body
        
        if (!blogId ||!viewId ||!comment) {
            return res.status(400)
              .json({ error: "Id is missing" });
        }
        const blogComment = await Comment.create({
            user: viewId,
            blog: blogId,
            comment
        })
        if (!blogComment) {
            return res.status(400)
              .json({ error: "Error in commenting" });
        }
        return res.status(200).json({
            message: "Success",
            data: blogComment
        });
    } catch (err) {
        return res.status(500)
        .json({
            message: "Internal server error",
            error: err.message
        })
    }
}

module.exports = {
    blogLike,
    createBlogComment
}