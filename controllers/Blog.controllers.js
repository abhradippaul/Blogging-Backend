
const BlogPost = require("../models/Blog.models.js");
const { uploadCloudinary, deleteCloudinary } = require("../utlis/Cloudinary.js");

const createBlog = async (req, res) => {
    const { title, slug, content, isActive } = req.body;
    const { owner } = req.user
    try {

        if (!owner) {
            return res.status(401)
                .json({ error: "You are not authorized to perform this action" })
        }
        // console.log(req.user);
        const imageData = req.file.path

        if (!title || !slug || !content) {
            return res.status(400).json({ error: 'Title, slug, and content are required' });
        }

        const cloudinaryResponse = await uploadCloudinary(imageData, "blog_folder")

        if (!cloudinaryResponse.secure_url || !cloudinaryResponse.public_id) {
            return await res.status(400)
                .json({
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

        if (updatedData.slug || updatedData.file ) {
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
                message : "Success",
                data : {
                    url : updatedBlog.featuredImage.url,
                    title : updatedBlog.title,
                    content : updatedBlog.content,
                    isActive : updatedBlog.isActive
                }
            });
    } catch (err) {
        return res.status(500)
            .json({ error: "Internal server error", message: err.message });
    }
}

const updateBlogImage = async(req, res) => {
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
        if (!blog.featuredImage.url ||!blog.featuredImage.public_id) {
            return res.status(404)
              .json({ message: "Blog url or id not found" })
        }
        const isDelete = await deleteCloudinary(blog.featuredImage.public_id);
        if (!isDelete) {
            return res.status(500)
            .json({ message: "Cloudinary delete error" })
        }
        
        const cloudinaryResponse = await uploadCloudinary(imageData.path, "blog_folder")
        if (!cloudinaryResponse.secure_url ||!cloudinaryResponse.public_id) {
            return res.status(400)
             .json({
                    message: "Problem occured in cloudinary"
                })
        }
        const updatedBlog = await BlogPost.findByIdAndUpdate(id, {
            featuredImage: {
                url : cloudinaryResponse.secure_url,
                public_id : cloudinaryResponse.public_id
            }
        },{timestamps: true})

        if (!updatedBlog) {
            return res.status(404)
           .json({ error: "Blog not found" });
        }
        return res.status(200).json({
            message : "Success",
            data : {
                url : updatedBlog.featuredImage.url,
                title : updatedBlog.title,
                content : updatedBlog.content,
                isActive : updatedBlog.isActive
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

        // if (!blog) {
        //     return res.status(404)
        //     .json({ error: "Blog not found" });
        // }

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
        const blogs = await BlogPost.find();

        if (!blogs) {
            return res.status(400).json({ error: "Blog not found" });
        }
        return res.status(200).json(blogs);

    } catch (err) {
        return res.status(500)
            .json({ message: "Internal server error" });
    }
}

const getBlog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400)
                .json({ err: "Id is missing" });
        }
        const blog = await BlogPost.findById(id);
        if (!blog) {
            return res.status(402)
                .json({ error: "Blog not found" });
        }

        return res.status(200).json(blog);

    } catch (err) {
        return res.status(500)
            .json({ message: "Internal server error" });
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