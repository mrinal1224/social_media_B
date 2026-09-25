import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";


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
            author: req.user._id

        })

        await User.findByIdAndUpdate(req.user._id, {
            $push: { posts: newPost._id }
        })


        const populatedPostData = await Post.findById(newPost._id).populate('author', 'name username profileImage')







        res.status(201).json({ message: "Post Created ", post: populatedPostData })

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error })
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name username profileImage')
            .sort({ createdAt: -1 });

        if (!posts || posts.length === 0) {
            return res.status(200).json({ message: 'No Posts to Show', posts: [] });
        }

        return res.status(200).json({ message: "All Posts Fetched", posts });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};