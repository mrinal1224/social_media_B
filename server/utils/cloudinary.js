import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"

// UPDATED: Load env before Cloudinary configuration, matching the A repo pattern.
dotenv.config({ override: false })

const requiredCloudinaryEnv = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
]

const missingCloudinaryEnv = requiredCloudinaryEnv.filter(
    (key) => !process.env[key]
)

if (missingCloudinaryEnv.length > 0) {
    throw new Error(
        `Missing Cloudinary environment variables: ${missingCloudinaryEnv.join(", ")}`
    )
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export default cloudinary
