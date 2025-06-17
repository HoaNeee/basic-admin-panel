import { createSlice } from "@reduxjs/toolkit";
import { appName } from "../../constants/appName";

export interface AuthState {
  userId: string;
  fullname: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  userId: "",
  fullname: "",
  role: "",
  accessToken: "",
  refreshToken: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    auth: initialState,
  },
  reducers: {
    addAuth: (state, action) => {
      state.auth = action.payload;
      const accessToken = action.payload.accessToken;
      const refreshToken = action.payload.refreshToken;

      if (accessToken && refreshToken) {
        const auth = {
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        syncLocalStorage(appName.auth, auth);
      }
      syncLocalStorage(appName.authData, {
        userId: action.payload.id,
        role: action.payload.role,
        email: action.payload.email,
      });
    },
    removeAuth: (state) => {
      state.auth = initialState;
    },
    refreshToken: (state) => {
      console.log(state);
    },
  },
});

export const { addAuth, removeAuth, refreshToken } = authSlice.actions;

export default authSlice.reducer;

const syncLocalStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};
