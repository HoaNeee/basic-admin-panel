import { createSlice } from "@reduxjs/toolkit";
import { appName } from "../../constants/appName";

export interface AuthState {
  userId: string;
  fullName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  avatar?: string;
  email?: string;
}

const initialState: AuthState = {
  userId: "",
  fullName: "",
  role: "",
  accessToken: "",
  refreshToken: "",
  avatar: "",
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
        userId: action.payload.userId,
        role: action.payload.role,
        email: action.payload.email,
        fullName: action.payload.fullName,
        avatar: action.payload.avatar,
      });
    },
    updateOnlyAuthData: (state, action) => {
      const auth = state.auth;
      const payload = {
        ...auth,
        ...action.payload,
      };
      state.auth = payload;
      syncLocalStorage(appName.authData, payload);
    },
    removeAuth: (state) => {
      state.auth = initialState;
    },
    refreshToken: (state) => {
      console.log(state);
    },
  },
});

export const { addAuth, removeAuth, refreshToken, updateOnlyAuthData } =
  authSlice.actions;

export default authSlice.reducer;

const syncLocalStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};
