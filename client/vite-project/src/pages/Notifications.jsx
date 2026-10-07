import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../redux/notificationsSlice";


const getNotificationText = (notification) => {

  const senderName =
    notification.sender?.name ||
    notification.sender?.username ||
    "Someone";


  if (notification.type === "follow") {

    return `${senderName} started following you`;

  }


  if (notification.type === "like") {

    return `${senderName} liked your ${notification.reel ? "reel" : "post"}`;

  }


  if (notification.type === "comment") {

    return `${senderName} commented on your ${notification.reel ? "reel" : "post"}`;

  }


  return `${senderName} sent you a notification`;

};


const getNotificationIcon = (type) => {

  if (type === "follow") return "👤";

  if (type === "like") return "♥";

  if (type === "comment") return "💬";

  return "🔔";

};


function Notifications() {

  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();


  const notifications =
    useSelector(
      (state) =>
        state.notifications.items
    );


  const loading =
    useSelector(
      (state) =>
        state.notifications.loading
    );


  const updating =
    useSelector(
      (state) =>
        state.notifications.updating
    );


  const error =
    useSelector(
      (state) =>
        state.notifications.error
    );


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;


  useEffect(() => {

    dispatch(
      fetchNotifications()
    );

  }, [dispatch]);


  const handleNotificationClick =
    async (notification) => {

      if (!notification.isRead) {

        await dispatch(
          markNotificationAsRead(
            notification._id
          )
        );

      }


      // For follow notifications we already have a clear destination:
      // the sender's profile.
      //
      // Like/comment destination routing can be added later
      // when post/reel detail routes exist.

      if (
        notification.type === "follow" &&
        notification.sender?.username
      ) {

        navigate(
          `/profile/${notification.sender.username}`
        );

      }

    };


  const handleMarkAllRead = () => {

    if (unreadCount === 0) {
      return;
    }


    dispatch(
      markAllNotificationsAsRead()
    );

  };


  return (

    <div className="min-h-screen bg-slate-50 text-slate-900">

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Back to home"
            >
              ←
            </button>


            <div>

              <h1 className="text-xl font-black tracking-tight">
                Notifications
              </h1>

              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={
              updating ||
              unreadCount === 0
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating
              ? "Updating..."
              : "Mark all as read"}
          </button>

        </div>

      </header>


      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">

        {loading && (

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading notifications...
          </div>

        )}


        {!loading && error && (

          <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-600 shadow-sm">
            {error}
          </div>

        )}


        {!loading &&
          !error &&
          notifications.length === 0 && (

            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="text-4xl">
                🔔
              </div>

              <h2 className="mt-4 font-black text-slate-800">
                No notifications yet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                When people interact with you, their activity will show up here.
              </p>

            </div>

          )}


        {!loading &&
          notifications.length > 0 && (

            <div className="space-y-3">

              {notifications.map(
                (notification) => {

                  const sender =
                    notification.sender;


                  return (

                    <button
                      key={notification._id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className={
                        `flex w-full items-start gap-4 rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                          notification.isRead
                            ? "border-slate-200 bg-white"
                            : "border-indigo-100 bg-indigo-50/70"
                        }`
                      }
                    >

                      <div className="relative shrink-0">

                        {sender?.profileImage ? (

                          <img
                            src={sender.profileImage}
                            alt={sender.name || sender.username || "User"}
                            className="h-12 w-12 rounded-full object-cover"
                          />

                        ) : (

                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">

                            {(
                              sender?.name ||
                              sender?.username ||
                              "U"
                            )
                              .slice(0, 1)
                              .toUpperCase()}

                          </div>

                        )}


                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs">
                          {getNotificationIcon(
                            notification.type
                          )}
                        </span>

                      </div>


                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <p
                              className={
                                `text-sm leading-6 ${
                                  notification.isRead
                                    ? "font-medium text-slate-700"
                                    : "font-bold text-slate-900"
                                }`
                              }
                            >
                              {getNotificationText(
                                notification
                              )}
                            </p>


                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </p>

                          </div>


                          {!notification.isRead && (

                            <span
                              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600"
                              aria-label="Unread"
                            />

                          )}

                        </div>

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          )}

      </main>

    </div>

  );

}


export default Notifications;
