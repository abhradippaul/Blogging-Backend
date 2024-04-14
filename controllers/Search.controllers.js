const BlogPost = require("../models/Blog.models.js");
const User = require("../models/User.models.js");

const searchUser = async (req, res) => {
    try {
        const { userInfo } = req.params
        if (!userInfo) {
            return res.status(400)
                .json({
                    message: "User info is required"
                })
        }
        const user = await User.aggregate([
            {
                $search: {
                    compound: {
                        should: [
                            {
                                "autocomplete": {
                                    "query": `${userInfo}`,
                                    "path": "description"
                                }
                            },
                            {
                                "autocomplete": {
                                    "query": `${userInfo}`,
                                    "path": "fullName"
                                }
                            }
                        ]
                    }
                }
            },
            // {
            //     $lookup: {
            //         from: "blogs",
            //         localField: "_id",
            //         foreignField: "owner",
            //         as: "blogs"
            //     }
            // },
            // {
            //     $project: {
            //         fullName: 1,
            //         userName: 1,
            //         _id: 0,
            //         "blogs.title": 1,
            //         "blogs.content": 1,
            //         "blogs.slug": 1
            //     }
            // },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    _id: 0
                }
            }
        ])

        // const blog = await BlogPost.aggregate([
        //     {
        //         $search: {
        //             compound: {
        //                 should: [
        //                     {
        //                         "autocomplete": {
        //                             "query": `${userInfo}`,
        //                             "path": "title"
        //                         }
        //                     },
        //                     {
        //                         "autocomplete": {
        //                             "query": `${userInfo}`,
        //                             "path": "content"
        //                         }
        //                     }
        //                 ]
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             title: 1,
        //             slug : 1,
        //             _id: 0
        //         }
        //     }
        // ])
        const blog = []

        if (!user?.length && !blog.length) {
            return res.status(400)
                .json({
                    message: "User and blog not found",
                    success: false
                })
        }
        return res.status(200).json({
            status: true,
            result : [
                ...user,
                ...blog
            ]
        })
    } catch (err) {
        return res.status(500)
            .json({
                message: "Internal server error",
                error: err.message
            })
    }
}

module.exports = {
    searchUser
}