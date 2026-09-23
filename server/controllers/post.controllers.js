import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import Post from "../models/post.model.js";


export const createPost = async (req, res) => {
    try {

        const { caption } = req.body

        let image;


        if (!caption || !req.file) {
            res.status(400).json({ message: "Add a Caption or an Image" })
        }

        if (caption.length > 500) {
            res.status(400).json({ message: "Caption Cannote be Greate than 500 characters" })
        }


        if (req.file) {
            const uploadedImage = await uploadToCloudinary(req.file.buffer)
            image = uploadedImage.secure_url
        }


        const newPost = await Post.create({
            image,
            caption,
            user: req.user._id

        })

        res.status(201).json({ message: "Post Created ", post: newPost })

} catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error })
    }
}