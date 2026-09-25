import express from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import { createPost, getAllPosts } from '../controllers/post.controllers.js'
import upload from '../middlewares/upload.middlerware.js'




const postRoutes = express.Router()


postRoutes.post('/createPost' , isAuthenticated ,upload.single('image') , createPost  )
postRoutes.get('/getAllPosts' ,isAuthenticated , getAllPosts)





export default postRoutes