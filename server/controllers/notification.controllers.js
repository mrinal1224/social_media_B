import Notification from "../models/notification.model.js";


// Get all notifications belonging to the logged-in user
export const getNotifications = async (req, res, next) => {

    try {

        // req.user comes from our authentication middleware
        const userId = req.user._id;


        // Find notifications where the logged-in user
        // is the receiver
        const notifications = await Notification.find({
            receiver: userId
        })

            // Latest notification should appear first
            .sort({
                createdAt: -1
            })

            // Instead of only returning sender's ObjectId,
            // get useful sender information as well
            .populate(
                "sender",
                "name username profileImage"
            )

            // If notification belongs to a post,
            // populate basic post information
            .populate(
                "post",
                "caption image"
            )

            // If notification belongs to a reel,
            // populate basic reel information
            .populate(
                "reel"
            )

            // If notification belongs to a comment,
            // populate the comment as well
            .populate(
                "comment",
                "text"
            );


        return res.status(200).json({

            message: "Notifications fetched successfully",

            notifications
        });


    } catch (error) {

        next(error);

    }

};


// Mark one notification as read
export const markNotificationAsRead = async (req, res, next) => {

    try {

        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,

                // Security:
                // a user can only mark their own notification as read.
                receiver: req.user._id
            },
            {
                isRead: true
            },
            {
                new: true
            }
        )
            .populate(
                "sender",
                "name username profileImage"
            )
            .populate(
                "post",
                "caption image"
            )
            .populate(
                "reel"
            )
            .populate(
                "comment",
                "text"
            );


        if (!notification) {

            return res.status(404).json({
                message: "Notification not found"
            });

        }


        return res.status(200).json({

            message: "Notification marked as read",

            notification

        });


    } catch (error) {

        next(error);

    }

};


// Mark every unread notification of the logged-in user as read
export const markAllNotificationsAsRead = async (req, res, next) => {

    try {

        await Notification.updateMany(
            {
                receiver: req.user._id,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );


        return res.status(200).json({
            message: "All notifications marked as read"
        });


    } catch (error) {

        next(error);

    }

};
