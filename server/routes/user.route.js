import express from 'express'
import { followUser, getMe, getUserProfile, loginUser, registerUser, testUpload, unfollowUser, updateProfile } from '../controllers/user.controllers.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import upload from '../middlewares/upload.middlerware.js'

const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/me', isAuthenticated, getMe)
userRoutes.get('/profile/:username', isAuthenticated, getUserProfile)

// Following and followers
userRoutes.post('/:id/follow', isAuthenticated, followUser)
userRoutes.delete('/:id/unfollow', isAuthenticated, unfollowUser)

// UPDATED: Authenticated multipart endpoint for profile fields + optional profileImage.
userRoutes.put('/profile', isAuthenticated, upload.single('profileImage'), updateProfile)

userRoutes.post('/testUpload' ,  upload.single('profileImage') , testUpload)

export default userRoutes
