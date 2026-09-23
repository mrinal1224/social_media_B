import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,//1234
        ref: "User",
        required: true
    },
    image: {
        type: String
    },

    caption: {
        type: String
    },


} , {timestamps: true})


const Post = mongoose.model('Post', postSchema)

export default Post