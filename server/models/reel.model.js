import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: String
    },

    caption: {
        type: String
    },


}, { timestamps: true })


const Reel = mongoose.model('Reel', reelSchema)

export default Reel