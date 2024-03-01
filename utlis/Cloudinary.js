
const fs = require("fs")
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const uploadCloudinary = async (imageData) => {
    if(!imageData) {
        return null
    }
    try {
        const cloudinaryResponse  = await cloudinary.uploader.upload(imageData)
        // console.log(cloudinaryResponse)
        fs.unlinkSync(imageData)
        return cloudinaryResponse
    } catch (err) {
        fs.unlinkSync(imageData)
        return null
    }

}

module.exports = {
    uploadCloudinary
}