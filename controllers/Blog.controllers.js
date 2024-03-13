
const mongoose = require("mongoose");
const BlogPost = require("../models/Blog.models.js");
const { uploadCloudinary, deleteCloudinary } = require("../utlis/Cloudinary.js");
const Like = require("../models/Like.models.js");
const optimize_url = process.env.OPTIMIZE_URL

const createBlog = async (req, res) => {
    const { title, slug, content, isActive } = req.body;
    const { _id } = req.user
    // console.log(req.file);
    try {

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
                url: optimize_url.concat(cloudinaryResponse.public_id),
                public_id: cloudinaryResponse.public_id
            }
        });

        if (!newBlogPost) {
            return res.status(500).json({ message: "Internal server error" });
        }

        return res.status(201)
            .json({ message: 'Blog post created successfully', data: newBlogPost });

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
                data: {
                    url: updatedBlog.featuredImage.url,
                    title: updatedBlog.title,
                    content: updatedBlog.content,
                    isActive: updatedBlog.isActive
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
        if (!blog.featuredImage.url || !blog.featuredImage.public_id) {
            return res.status(404)
                .json({ message: "Blog url or id not found" })
        }
        const isDelete = await deleteCloudinary(blog.featuredImage.public_id);
        if (!isDelete) {
            return res.status(500)
                .json({ message: "Cloudinary delete error" })
        }

        const cloudinaryResponse = await uploadCloudinary(imageData.path, "blog_folder")
        if (!cloudinaryResponse.secure_url || !cloudinaryResponse.public_id) {
            return res.status(400)
                .json({
                    message: "Problem occured in cloudinary"
                })
        }
        const updatedBlog = await BlogPost.findByIdAndUpdate(id, {
            featuredImage: {
                url: cloudinaryResponse.secure_url,
                public_id: cloudinaryResponse.public_id
            }
        }, { timestamps: true })

        if (!updatedBlog) {
            return res.status(404)
                .json({ error: "Blog not found" });
        }
        return res.status(200).json({
            message: "Success",
            data: {
                url: updatedBlog.featuredImage.url,
                title: updatedBlog.title,
                content: updatedBlog.content,
                isActive: updatedBlog.isActive
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

        if (!blog.featuredImage.url || !blog.featuredImage.public_id) {
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
            .json({ message: "Blog deleted successfully" });

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
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    isActive: 1,
                    "featuredImage.url": 1,
                    "owner": 1,
                    "likes": 1,
                    _id: 0
                }
            }
        ])

        if (!blogs) {
            return res.status(400).json({ error: "Blog not found" });
        }
        return res.status(200).json({
            message: "Success",
            data: blogs
        });

    } catch (err) {
        console.log(err.message)
        return res.status(500)
            .json({
                message: "Internal server error",
                error: err.message
            });
    }
}

const getBlog = async (req, res) => {
    try {
        let { id } = req.params;
        let { _id } = req.user

        id = new mongoose.Types.ObjectId(id)

        if (!id || !_id) {
            return res.status(400)
                .json({ err: "Id is missing" });
        }
        const blog = await BlogPost.aggregate([
            {
                $match: {
                    _id: id
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
                            $project: {
                                fullName: 1
                            }
                        },
                        {
                            $lookup: {
                                from: "follows",
                                localField: "_id",
                                foreignField: "channel",
                                as: "follows",
                                pipeline : [
                                    
                                ]
                            }
                        }, 
                        {
                            $addFields: {
                                follows: {
                                    count: {
                                        $size: "$follows"
                                    },
                                    isFollowed: {
                                        $cond: {
                                            if: {
                                                $in: [new mongoose.Types.ObjectId(_id), "$follows.user"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $addFields : {
                                follows: {
                                    $first : "$follows"
                                }
                            }
                        },
                        {
                            $project : {
                                "follows.count" : 1,
                                "follows.isFollowed" : 1
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
                        $size: "$likes"
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
                            $project: {
                                user: 1,
                                comment: 1,
                                _id: 0
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $project: {
                                            userName: 1,
                                            _id: 0
                                        }
                                    },
                                ]
                            }
                        },
                        {
                            $addFields: {
                                user: {
                                    $first: "$user.userName"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    "featuredImage.url": 1,
                    likesCount: 1,
                    owner: 1,
                    comments: 1,
                    _id: 0
                }
            }
        ]);

        if (!blog[0]) {
            return res.status(402)
                .json({ error: "Blog not found" });
        }

        return res.status(200).json({
            message: "Success",
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