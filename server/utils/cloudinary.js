import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.Cloud_name,
    api_key: process.env.Cloud_Api_key,
    api_secret: process.env.Cloud_Api_secret
})

export default cloudinary
