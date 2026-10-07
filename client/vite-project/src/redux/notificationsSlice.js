import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axiosCalls/axios";


// --------------------------------------------------
// FETCH NOTIFICATIONS
// --------------------------------------------------

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",

  async (_, { rejectWithValue }) => {

    try {

      const response = await axiosInstance.get(
        "/notification/getAllNotifications"
      );

      return response.data.notifications;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message ||
        "Unable to fetch notifications"
      );

    }

  }
);


// --------------------------------------------------
// MARK ONE AS READ
// --------------------------------------------------

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",

  async (notificationId, { rejectWithValue }) => {

    try {

      const response = await axiosInstance.patch(
        `/notification/${notificationId}/read`
      );

      return response.data.notification;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message ||
        "Unable to mark notification as read"
      );

    }

  }
);


// --------------------------------------------------
// MARK ALL AS READ
// --------------------------------------------------

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllNotificationsAsRead",

  async (_, { rejectWithValue }) => {

    try {

      await axiosInstance.patch(
        "/notification/readAll"
      );

      return true;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.message ||
        "Unable to mark notifications as read"
      );

    }

  }
);


const initialState = {

  items: [],

  loading: false,

  error: "",

  updating: false

};


const notificationsSlice = createSlice({

  name: "notifications",

  initialState,


  reducers: {

    // Socket.IO uses this reducer when a new realtime notification arrives.
    addNotification: (state, action) => {

      const incomingNotification =
        action.payload;


      const alreadyExists =
        state.items.some(
          (notification) =>
            notification._id ===
            incomingNotification._id
        );


      if (!alreadyExists) {

        state.items.unshift(
          incomingNotification
        );

      }

    },


    clearNotifications: (state) => {

      state.items = [];

      state.loading = false;

      state.updating = false;

      state.error = "";

    }

  },


  extraReducers: (builder) => {

    builder


      // --------------------------------------------------
      // FETCH
      // --------------------------------------------------

      .addCase(
        fetchNotifications.pending,
        (state) => {

          state.loading = true;

          state.error = "";

        }
      )


      .addCase(
        fetchNotifications.fulfilled,
        (state, action) => {

          state.loading = false;

          state.items =
            action.payload || [];

        }
      )


      .addCase(
        fetchNotifications.rejected,
        (state, action) => {

          state.loading = false;

          state.error =
            action.payload ||
            "Unable to fetch notifications";

        }
      )


      // --------------------------------------------------
      // MARK ONE READ
      // --------------------------------------------------

      .addCase(
        markNotificationAsRead.pending,
        (state) => {

          state.updating = true;

          state.error = "";

        }
      )


      .addCase(
        markNotificationAsRead.fulfilled,
        (state, action) => {

          state.updating = false;


          const updatedNotification =
            action.payload;


          const index =
            state.items.findIndex(
              (notification) =>
                notification._id ===
                updatedNotification._id
            );


          if (index !== -1) {

            state.items[index] =
              updatedNotification;

          }

        }
      )


      .addCase(
        markNotificationAsRead.rejected,
        (state, action) => {

          state.updating = false;

          state.error =
            action.payload ||
            "Unable to mark notification as read";

        }
      )


      // --------------------------------------------------
      // MARK ALL READ
      // --------------------------------------------------

      .addCase(
        markAllNotificationsAsRead.pending,
        (state) => {

          state.updating = true;

          state.error = "";

        }
      )


      .addCase(
        markAllNotificationsAsRead.fulfilled,
        (state) => {

          state.updating = false;


          state.items.forEach(
            (notification) => {

              notification.isRead = true;

            }
          );

        }
      )


      .addCase(
        markAllNotificationsAsRead.rejected,
        (state, action) => {

          state.updating = false;

          state.error =
            action.payload ||
            "Unable to mark notifications as read";

        }
      );

  }

});


export const {
  addNotification,
  clearNotifications
} = notificationsSlice.actions;


export default notificationsSlice.reducer;
