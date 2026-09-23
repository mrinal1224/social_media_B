import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import postRoutes from './routes/post.routes.js'

const app = express()
const Port = 8085

dotenv.config()

mongoose.connect(process.env.dbUrl).then(() => {
    console.log("Db Connected")
}).catch((err) => {
    console.log(err)
})

app.use(cors(
    {
        origin : "http://localhost:5173",
        credentials : true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
))


app.use(express.json())
app.use(cookieParser())



app.use('/users' , userRoutes)
app.use('/post' , postRoutes)



app.get('/', (req, res) => {
    res.send('Sever On Hellllooooo...')
})


app.listen(Port, () => {
    console.log(`Server Startet at ${Port}`)
})

