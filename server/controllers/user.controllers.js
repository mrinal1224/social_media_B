// register controller
import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js"
import uploadToCloudinary from "../utils/uploadToCloudinary.js"

const cookieOptions = {
    httpOnly: true
}

const sanitizeUser = (user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user }
    delete safeUser.password
    return safeUser
}

export const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (password.length <= 6) {
            return res.status(400).json({ message: 'Password should be greater than 6 characters' })
        }

        const userExists = await User.findOne({ username })
        if (userExists) return res.status(409).json({ message: 'User Already Exists' })

        const emailExists = await User.findOne({ email })
        if (emailExists) return res.status(409).json({ message: 'User Already Exists' })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({ name, username, email, password: hashedPassword })
        const token = genToken(newUser._id)
        res.cookie('token', token, cookieOptions)

        return res.status(201).json({
            message: 'User Registered',
            user: sanitizeUser(newUser)
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'All fields are required' })

        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: 'User Not Found' })

        const passwordMatched = await bcrypt.compare(password, user.password)
        if (!passwordMatched) return res.status(401).json({ message: 'Password Did not match' })

        const token = genToken(user._id)
        res.cookie('token', token, cookieOptions)

        return res.status(200).json({
            message: 'User Logged In',
            userData: sanitizeUser(user)
        })
    } catch (error) {
        return res.status(500).json({ message: 'Server crashed', error: error.message })
    }
}

export const getMe = async (req, res) => {
    return res.status(200).json(sanitizeUser(req.user))
}

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params

        const userData = await User.findOne({ username })
            .select('-password')
            .populate('followers', 'name username profileImage')
            .populate('followings', 'name username profileImage')

        if (!userData) {
            return res.status(404).json({ message: 'User Not Found' })
        }

        return res.status(200).json({
            message: 'User found',
            userData
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const followUser = async (req, res) => {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.id

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(409).json({ message: 'You cannot follow yourself' })
        }

        const targetUser = await User.findById(targetUserId)

        if (!targetUser) {
            return res.status(404).json({ message: 'No Target User Found' })
        }

        const alreadyFollowing = targetUser.followers.some(
            (id) => id.toString() === currentUserId.toString()
        )

        if (alreadyFollowing) {
            return res.status(409).json({ message: 'You are already following this user' })
        }

        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { followings: targetUserId }
        })

        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        })

        return res.status(200).json({ message: 'User followed' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.id

        if (currentUserId.toString() === targetUserId.toString()) {
            return res.status(409).json({ message: 'You cannot unfollow yourself' })
        }

        const targetUser = await User.findById(targetUserId)

        if (!targetUser) {
            return res.status(404).json({ message: 'No Target User Found' })
        }

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { followings: targetUserId }
        })

        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId }
        })

        return res.status(200).json({ message: 'User unfollowed' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const testUpload = (req , res)=>{
    try {
        res.send(req.file)
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' }) 
    }
}


// UPDATED: Profile update follows the same flow as Social-Media-A-2029.
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { name, username, email, bio } = req.body

        if (!name?.trim() || !username?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: 'Name, username and email are required'
            })
        }

        const cleanUsername = username.trim()
        const normalizedEmail = email.trim().toLowerCase()

        if (await User.findOne({ username: cleanUsername, _id: { $ne: userId } })) {
            return res.status(409).json({ message: 'Username already exists' })
        }

        if (await User.findOne({ email: normalizedEmail, _id: { $ne: userId } })) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        const updates = {
            name: name.trim(),
            username: cleanUsername,
            email: normalizedEmail,
            bio: bio?.trim() || ''
        }

        if (req.file) {
            // UPDATED: Keep Cloudinary upload logic in a separate utility.
            const uploadedImage = await uploadToCloudinary(req.file.buffer)
            updates.profileImage = uploadedImage.secure_url
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select('-password')

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        })
    } catch (error) {
        next(error)
    }
}
