import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import { addNotification, fetchNotifications } from "../redux/notificationsSlice";


const SocketManager = () => {

    const { user } = useAuth();
    const dispatch = useDispatch();


    useEffect(() => {

        if (!user?._id) {
            return;
        }

        // Hydrate persistent/offline notifications from MongoDB.
        dispatch(fetchNotifications());


        // ------------------------------------------
        // SOCKET CONNECTED
        // ------------------------------------------

        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );


            // Tell server which user owns this socket

            socket.emit(
                "register-user",
                user._id
            );

        };


        // ------------------------------------------
        // CONNECTION ERROR
        // ------------------------------------------

        const handleConnectError = (
            error
        ) => {

            console.log(
                "Socket connection error:",
                error.message
            );

        };


        // ------------------------------------------
        // DISCONNECT
        // ------------------------------------------

        const handleDisconnect = (
            reason
        ) => {

            console.log(
                "Socket disconnected:",
                reason
            );

        };


        // ------------------------------------------
        // NEW REALTIME NOTIFICATION
        // ------------------------------------------

        const handleNewNotification = (
            notification
        ) => {

            console.log(
                "NEW REALTIME NOTIFICATION:",
                notification
            );

            // Store the realtime notification in Redux so the whole app reacts instantly.
            dispatch(addNotification(notification));

        };


        // ------------------------------------------
        // REGISTER LISTENERS
        // ------------------------------------------

        socket.on(
            "connect",
            handleConnect
        );


        socket.on(
            "connect_error",
            handleConnectError
        );


        socket.on(
            "disconnect",
            handleDisconnect
        );


        socket.on(
            "new-notification",
            handleNewNotification
        );


        // ------------------------------------------
        // CONNECT
        // ------------------------------------------

        socket.connect();


        // If already connected,
        // register the user immediately

        if (socket.connected) {

            socket.emit(
                "register-user",
                user._id
            );

        }


        // ------------------------------------------
        // CLEANUP
        // ------------------------------------------

        return () => {

            socket.off(
                "connect",
                handleConnect
            );


            socket.off(
                "connect_error",
                handleConnectError
            );


            socket.off(
                "disconnect",
                handleDisconnect
            );


            socket.off(
                "new-notification",
                handleNewNotification
            );


            socket.disconnect();

        };

    }, [user?._id, dispatch]);


    return null;
};


export default SocketManager;