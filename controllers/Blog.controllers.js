const mongoose = require("mongoose");
const BlogPost = require("../models/Blog.models.js");
const { uploadCloudinary, deleteCloudinary } = require("../utlis/Cloudinary.js");


const createBlog = async (req, res) => {
    const { title, slug, content, isActive } = req.body;
    const { _id } = req.user
    try {
        // console.log(_id)
        // console.log(req.headers)
        if (!_id) {
            return res.status(401)
                .json({ error: "You are not authorized to perform this action" })
        }
        const imageData = req?.file?.path || null

        if (!title || !slug || !content || !imageData) {
            return res.status(400).json({ error: 'Title, slug, image and content are required' });
        }

        const cloudinaryResponse = await uploadCloudinary(imageData, "blog_folder/blog")

        if (!cloudinaryResponse.public_id) {
            return res.status(400)
                .json({ message: "Cloudinary upload went wrong" })
        }
        const newBlogPost = await BlogPost.create({
            title,
            slug,
            content,
            isActive: isActive,
            owner: _id,
            featuredImage: {
                public_id: cloudinaryResponse.public_id
            }
        });

        if (!newBlogPost) {
            return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(201)
            .json({ message: 'Blog post created successfully', data: newBlogPost, success: true });

    } catch (err) {
        return res.status(500)
            .json({
                msg: 'Internal server error',
                error: err.message
            });
    }
};

const updateBlog = async (req, res) => {
    try {
        const updatedData = req.body;
        const { id } = req.params;

        if (updatedData.slug || updatedData.file) {
            return res.status(400)
                .json({ error: "Slug cannot be updated" });
        }
        if (!id) {
            return res.status(400)
                .json({ error: "UserName is missing" });
        }

        const updatedBlog = await BlogPost.findByIdAndUpdate(id, {
            ...updatedData
        }, { new: true });

        if (!updatedBlog) {
            return res.status(404)
                .json({ error: "Blog not found" });
        }


        return res.status(200)
            .json({
                message: "Success",
                success: true,
                data: {
                    url: updatedBlog.featuredImage.public_id,
                    title: updatedBlog.title,
                    content: updatedBlog.content,
                }
            });
    } catch (err) {
        return res.status(500)
            .json({ error: "Internal server error", message: err.message });
    }
}

const updateBlogImage = async (req, res) => {
    try {
        const { id } = req.params;
        const imageData = req.file

        if (!id || !imageData) {
            return res.status(400)
                .json({ error: "Id or path is missing" });
        }

        const blog = await BlogPost.findById(id);
        if (!blog) {
            return res.status(404)
                .json({ error: "Blog not found" });
        }
        if (!blog.featuredImage.public_id) {
            return res.status(404)
                .json({ message: "Blog url or id not found" })
        }
        const isDelete = await deleteCloudinary(blog.featuredImage.public_id);
        if (!isDelete) {
            return res.status(500)
                .json({ message: "Cloudinary delete error" })
        }

        const cloudinaryResponse = await uploadCloudinary(imageData.path, "blog_folder")
        if (!cloudinaryResponse.public_id) {
            return res.status(400)
                .json({
                    message: "Problem occured in cloudinary"
                })
        }
        const updatedBlog = await BlogPost.findByIdAndUpdate(id, {
            featuredImage: {
                public_id: cloudinaryResponse.public_id
            }
        }, { timestamps: true })

        if (!updatedBlog) {
            return res.status(404)
                .json({ error: "Blog not found" });
        }
        return res.status(200).json({
            message: "Success",
            success: true,
            data: {
                url: updatedBlog.featuredImage.public_id,
                title: updatedBlog.title,
                content: updatedBlog.content,
            }
        })

    } catch (err) {
        return res.status(500)
            .json({ error: "Internal server error", message: err.message });
    }
}

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await BlogPost.findById(id);

        if (!blog) {
            return res.status(404)
                .json({ error: "Blog not found" });
        }

        if (!blog.featuredImage.public_id) {
            return res.status(404)
                .json({ message: "Blog not found" })
        }

        const isDelete = await deleteCloudinary(blog.featuredImage.public_id);

        if (!isDelete) {
            return res.status(500)
                .json({ message: "Cloudinary delete error" })
        }

        const isDeleteDatabase = await BlogPost.findByIdAndDelete(id);

        if (!isDeleteDatabase) {
            return res.status(400)
                .json({
                    message: "Error in deleting database"
                })
        }

        return res.status(200)
            .json({ message: "Blog deleted successfully", success: true });

    } catch (err) {
        console.error(err);
        res.status(500)
            .json({ error: "Internal server error" });
    }
}

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogPost.aggregate([
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "blog",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes"
                    }
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "blog",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $lookup: {
                                from: "follows",
                                localField: "_id",
                                foreignField: "channel",
                                as: "followers"
                            }
                        },
                        {
                            $addFields: {
                                followersCount: {
                                    $size: "$followers"
                                }
                            }
                        },
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $project: {
                    createdAt: 1,
                    slug: 1,
                    title: 1,
                    content: 1,
                    _id: 0,
                    "featuredImage.public_id": 1,
                    "owner.userName": 1,
                    "owner.featuredImage": 1,
                    "owner.followersCount": 1,
                    "likesCount": 1,
                    "commentsCount": 1,
                    "followersCount": 1,
                }
            }
        ])

        if (!blogs) {
            return res.status(400).json({ error: "Blog not found" });
        }
        return res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (err) {
        console.log(err.message)
        return res.status(500)
            .json({
                message: "Internal server error",
                error: err.message,
                success: false
            });
    }
}

const getBlog = async (req, res) => {
    try {
        let { slug } = req.params;
        let { _id } = req.user
        _id = new mongoose.Types.ObjectId(_id)

        if (!slug || !_id) {
            return res.status(400)
                .json({ err: "Id or slug is missing" });
        }
        const blog = await BlogPost.aggregate([
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $lookup: {
                                from: "follows",
                                localField: "_id",
                                foreignField: "channel",
                                as: "follows"
                            }
                        },
                        {
                            $addFields: {
                                followersCount: {
                                    $size: {
                                        $ifNull: ["$follows", 0]
                                    }
                                },
                                isFollowed: {
                                    $cond: {
                                        if: {
                                            $in: [_id, "$follows.user"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "blog",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: {
                            $ifNull: ["$likes", []]
                        }
                    },
                    isLiked: {
                        $cond: {
                            if: {
                                $in: [_id, "$likes.user"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "blog",
                    as: "comments",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "_id",
                                as: "user",
                            }
                        },
                        {
                            $addFields: {
                                userName: {
                                    $first: "$user.userName"
                                },
                                featuredImage: {
                                    $first: "$user.featuredImage.public_id"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    },
                }

            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    "featuredImage.public_id": 1,
                    "owner.fullName": 1,
                    "owner.userName": 1,
                    "owner.featuredImage.public_id": 1,
                    "owner.followersCount": 1,
                    "owner.isFollowed": 1,
                    "owner._id": 1,
                    "likesCount": 1,
                    "isLiked": 1,
                    "comments.userName": 1,
                    "comments._id": 1,
                    "comments.comment": 1,
                    "comments.createdAt": 1,
                    "comments.featuredImage": 1,
                    "commentsCount": 1
                }
            }
        ]);

        if (!blog[0]) {
            return res.status(402)
                .json({ error: "Blog not found" });
        }

        return res.status(200).json({
            success: true,
            data: blog[0]
        });

    } catch (err) {
        return res.status(500)
            .json({
                message: "Internal server error",
                error: err.message
            });
    }
}







module.exports = {
    createBlog,
    updateBlog,
    updateBlogImage,
    deleteBlog,
    getAllBlogs,
    getBlog
}