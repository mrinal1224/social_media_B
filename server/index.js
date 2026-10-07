import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import reelRoutes from "./routes/reel.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import storyRoutes from "./routes/story.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

import {
    initializeSocket
} from "./socket/socket.js";


// ----------------------------------------------------
// PATH SETUP
// ----------------------------------------------------

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


// ----------------------------------------------------
// ENV
// ----------------------------------------------------

dotenv.config({
    path: path.join(
        __dirname,
        ".env"
    )
});


const requiredEnvVars = [
    "dbURL",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
];


const missingEnvVars =
    requiredEnvVars.filter(
        (key) => !process.env[key]
    );


if (missingEnvVars.length > 0) {

    console.error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );

    process.exit(1);
}


// ----------------------------------------------------
// EXPRESS + HTTP SERVER
// ----------------------------------------------------

const app = express();

const httpServer =
    createServer(app);


// ----------------------------------------------------
// SOCKET.IO
// ----------------------------------------------------

// Socket.IO is initialized using
// the same HTTP server used by Express.

initializeSocket(httpServer);


// ----------------------------------------------------
// PORT
// ----------------------------------------------------

const port = 8084;


// ----------------------------------------------------
// DATABASE
// ----------------------------------------------------

mongoose
    .connect(process.env.dbURL)

    .then(() => {

        console.log(
            "DB Connected"
        );

    })

    .catch((error) => {

        console.log(error);

    });


// ----------------------------------------------------
// MIDDLEWARE
// ----------------------------------------------------

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);


app.use(express.json());

app.use(cookieParser());


// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

app.use(
    "/users",
    userRoutes
);


app.use(
    "/posts",
    postRoutes
);


app.use(
    "/reels",
    reelRoutes
);


app.use(
    "/comments",
    commentRoutes
);


app.use(
    "/stories",
    storyRoutes
);


app.use(
    "/notification",
    notificationRoutes
);


// ----------------------------------------------------
// ERROR HANDLER
// ----------------------------------------------------

app.use(errorMiddleware);


// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

httpServer.listen(
    port,
    () => {

        console.log(
            `Server Started at ${port}`
        );

    }
);