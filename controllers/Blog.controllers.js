const statusList = require("../BackendStatus");
const BlogPost = require("../models/Blog.models")
const createBlog = async (req, res) => {
    const { title, slug, content, isActive, featuredImage } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    try {
        const newBlogPost = await BlogPost.create({
            title,
            slug,
            content,
            isActive: isActive,
            // featuredImage 
        });

        if (!newBlogPost) {
            return res.status(statusList.internalServerError.value).json({ message: statusList.internalServerError.name});
        }
        return res.status(statusList.created.value).json({ message: 'Blog post created successfully', data: newBlogPost });

    } catch (err) {
        return res.status(500)
        .json({ msg: 'Internal server error',
         error: err.message });
    }
};




module.exports = {
    createBlog
}