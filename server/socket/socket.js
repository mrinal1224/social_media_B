import { Server } from "socket.io";


// Socket.IO server instance
let io;


// Stores:
//
// userId -> socketId
//
// Example:
//
// "123" -> "AbCdEf..."
const onlineUsers = new Map();


// --------------------------------------------------
// INITIALIZE SOCKET.IO
// --------------------------------------------------

export const initializeSocket = (httpServer) => {

    io = new Server(httpServer, {

        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }

    });


    io.on("connection", (socket) => {

        console.log(
            "Socket connected:",
            socket.id
        );


        // --------------------------------------------------
        // REGISTER LOGGED-IN USER
        // --------------------------------------------------

        socket.on("register-user", (userId) => {

            if (!userId) {
                return;
            }


            const userIdString =
                userId.toString();


            // Store:
            //
            // userId -> socketId

            onlineUsers.set(
                userIdString,
                socket.id
            );


            // Store userId on this particular socket as well.
            //
            // This helps us remove the correct user
            // when the socket disconnects.

            socket.userId =
                userIdString;


            console.log(
                "User registered:",
                userIdString
            );


            console.log(
                "Online Users:",
                Array.from(
                    onlineUsers.entries()
                )
            );

        });


        // --------------------------------------------------
        // DISCONNECT
        // --------------------------------------------------

        socket.on("disconnect", () => {

            console.log(
                "Socket disconnected:",
                socket.id
            );


            if (socket.userId) {

                // Make sure that the socket being disconnected
                // is still the socket currently stored
                // for this user.

                if (
                    onlineUsers.get(socket.userId)
                    === socket.id
                ) {

                    onlineUsers.delete(
                        socket.userId
                    );

                }


                console.log(
                    "Online Users:",
                    Array.from(
                        onlineUsers.entries()
                    )
                );

            }

        });

    });


    return io;
};


// --------------------------------------------------
// SEND REALTIME NOTIFICATION TO ONE USER
// --------------------------------------------------

export const sendNotification = (
    userId,
    notification
) => {

    // Socket.IO should already be initialized
    if (!io) {

        console.log(
            "Socket.IO has not been initialized"
        );

        return;
    }


    // Find receiver's socket
    const receiverSocketId =
        onlineUsers.get(
            userId.toString()
        );


    // Receiver may currently be offline.
    //
    // This is NOT a problem because the notification
    // is already safely stored in MongoDB.

    if (!receiverSocketId) {

        console.log(
            "Receiver is currently offline:",
            userId.toString()
        );

        return;
    }


    // Send the event only to the receiver's socket

    io
        .to(receiverSocketId)
        .emit(
            "new-notification",
            notification
        );


    console.log(
        "Realtime notification sent to:",
        userId.toString()
    );

};