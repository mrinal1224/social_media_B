import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import User from "../models/user.model.js";
import uploadVideoToCloudinary from "../utils/uploadVideoCloudinary.js";


export const createReel = async (req, res) => {
    try {

        const { caption } = req.body

        let video;


        if (!caption || !req.file) {
            res.status(400).json({ message: "Add a Caption or a Video" })
        }

        if (caption.length > 500) {
            res.status(400).json({ message: "Caption Cannote be Greate than 500 characters" })
        }


        if (req.file) {
            const uploadedReel = await uploadVideoToCloudinary(req.file.buffer)
            video = uploadedReel.secure_url
        }


        const newReel = await Reel.create({
            video,
            caption,
            author: req.user._id

        })

        await User.findByIdAndUpdate(req.user._id , {
            $push : {reels :newReel._id }
        })


     const populatedReelData = await Reel.findById(newReel._id).populate('author' , 'name username profileImage')







        res.status(201).json({ message: "Reel Created ", reel: populatedReelData })

} catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error })
    }
}


