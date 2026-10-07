import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axiosCalls/axios";

// Fetch notifications already stored in MongoDB.
// This restores notifications after refresh and includes anything received while offline.
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/notification/getAllNotifications");
      return response.data.notifications;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to fetch notifications"
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: "",
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Socket.IO uses this reducer when a new realtime notification arrives.
    addNotification: (state, action) => {
      const incomingNotification = action.payload;

      // The API and socket can occasionally deliver the same notification.
      // Avoid storing duplicate MongoDB notification ids.
      const alreadyExists = state.items.some(
        (notification) => notification._id === incomingNotification._id
      );

      if (!alreadyExists) {
        state.items.unshift(incomingNotification);
      }
    },

    markNotificationRead: (state, action) => {
      const notification = state.items.find(
        (item) => item._id === action.payload
      );

      if (notification) {
        notification.isRead = true;
      }
    },

    markAllNotificationsRead: (state) => {
      state.items.forEach((notification) => {
        notification.isRead = true;
      });
    },

    clearNotifications: (state) => {
      state.items = [];
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to fetch notifications";
      });
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
