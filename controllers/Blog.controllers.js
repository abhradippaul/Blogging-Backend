const statusList = require("../BackendStatus.js");
const BlogPost = require("../models/Blog.models.js");
const { uploadCloudinary } = require("../utlis/Cloudinary.js");
const createBlog = async (req, res) => {
    const { title, slug, content, isActive } = req.body;
    const imageData = req.file.path
    console.log(imageData)
    if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content are required' });
    }
    try {
        const cloudinaryResponse = await uploadCloudinary(imageData)
        console.log(cloudinaryResponse)
        if (!cloudinaryResponse.secure_url || !cloudinaryResponse.asset_id) {
            return await res.status(statusList.noContent.value).json({
                error: statusList.noContent.name,
                message: "Problem occured in cloudinary"
            })
        }
        const newBlogPost = await BlogPost.create({
            title,
            slug,
            content,
            isActive: isActive,
            featuredImage: {
                url: cloudinaryResponse.secure_url,
                asset_id : cloudinaryResponse.asset_id
            }
        });

        if (!newBlogPost) {
            return res.status(statusList.internalServerError.value).json({ message: statusList.internalServerError.name });
        }
        return res.status(statusList.created.value).json({ message: 'Blog post created successfully', data: newBlogPost });

    } catch (err) {
        return res.status(500)
            .json({
                msg: 'Internal server error',
                error: err.message
            });
    }
};




module.exports = {
    createBlog
}