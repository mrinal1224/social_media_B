import express from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware'
import { createPost } from '../controllers/post.controllers'



const postRoutes = express.Router()


postRoutes.post('/createPost' , isAuthenticated ,upload.single('image') , createPost  )





export default postRoutes