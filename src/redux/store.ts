import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";
import settingReducer from "./reducers/settingReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    setting: settingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
