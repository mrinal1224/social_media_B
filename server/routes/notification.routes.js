import express from "express";
import isAuthenticated from "../middlewares/authMiddleware.js";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../controllers/notification.controllers.js";


const notificationRoutes = express.Router();


// Fetch all notifications
notificationRoutes.get(
    "/getAllNotifications",
    isAuthenticated,
    getNotifications
);


// Mark all notifications as read
notificationRoutes.patch(
    "/readAll",
    isAuthenticated,
    markAllNotificationsAsRead
);


// Mark one notification as read
notificationRoutes.patch(
    "/:id/read",
    isAuthenticated,
    markNotificationAsRead
);


export default notificationRoutes;
