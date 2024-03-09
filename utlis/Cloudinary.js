
const fs = require("fs")
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const uploadCloudinary = async (imageData,folderName) => {
    if(!imageData) {
        return null
    }
    try {
        const cloudinaryResponse  = await cloudinary.uploader.upload(imageData,{
            folder: folderName
        })
        // console.log(cloudinaryResponse)
        fs.unlinkSync(imageData)
        return cloudinaryResponse
    } catch (err) {
        // console.log(err.message)
        fs.unlinkSync(imageData)
        return null
    }

}

const deleteCloudinary = async (public_id) => {
    try {
        const cloudinaryResponse  = await cloudinary.api.delete_resources([public_id])
        return cloudinaryResponse
    } catch (err) {
        return null
    }
}

module.exports = {
    uploadCloudinary,
    deleteCloudinary
}