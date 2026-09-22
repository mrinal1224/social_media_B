import express from 'express'
import { followUser, getMe, getUserProfile, loginUser, registerUser, unfollowUser, updateProfile } from '../controllers/user.controllers.js'
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

// UPDATED: Profile update follows the same API contract as Social-Media-A-2029.
userRoutes.post('/updateProfile', isAuthenticated, upload.single('profileImage'), updateProfile)



export default userRoutes
