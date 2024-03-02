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

const updateBlog = async(req,res) => {
    try {
        const { title, content, isActive } = req.body;
        const id = req.params.id;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and Content are required" });
        }

        const updatedBlog = await BlogPost.findByIdAndUpdate(id, {
            title,
            content,
            isActive
        }, { new: true });

        if (!updatedBlog) {
            return res.status(statusList.notFound.value).json({ error: "Blog not found" });
        }

        await updatedBlog.save();

        return res.status(200).json(updatedBlog);
    } catch (err) {
        return res.status(statusList.internalServerError.value).json({ error: "Server error", message : err.message });
    }
}

const deleteBlog = async(req,res) => {
    try {
        const id = req.params.id;

        const blog = await BlogPost.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        if (blog.imageUrl) {
            const public_id = blog.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(public_id);
        }

        await BlogPost.findByIdAndDelete(id);

        return res.status(statusList.statusOK.value).json({ message: "Blog deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(statusList.internalServerError.value).json({ error: "Server error", message : err.message });
    }
}



module.exports = {
    createBlog,
    updateBlog,
    deleteBlog
}