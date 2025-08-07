import { createSlice } from "@reduxjs/toolkit";

export interface SettingState {
  iteName: string;
  companyName: string;
  logoLight: string;
  logoDark: string;
  siteFavicon: string;

  domain: string;
  subdomain: string[];
  description: string;
  keywords: string[];

  email: string;
  phone: string;
  address: string;

  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;

  timezone: string;
  language: string;
  currency: string;

  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  googleAnalyticsId: string;
  facebookPixelId: string;

  // Email Configuration (SMTP)
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
}

const initialState: SettingState = {
  iteName: "",
  companyName: "",
  logoLight: "",
  logoDark: "",
  siteFavicon: "",
  domain: "",
  subdomain: [],
  description: "",
  keywords: [],
  email: "",
  phone: "",
  address: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  timezone: "",
  language: "",
  currency: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  googleAnalyticsId: "",
  facebookPixelId: "",
  smtpHost: "",
  smtpPort: 0,
  smtpUsername: "",
  smtpPassword: "",
};

const settingSlice = createSlice({
  name: "setting",
  initialState: {
    setting: initialState,
  },
  reducers: {
    addSetting: (state, action) => {
      state.setting = action.payload;
    },
    updateSetting: (state, action) => {
      state.setting = { ...state.setting, ...action.payload };
    },
  },
});

export const { addSetting, updateSetting } = settingSlice.actions;

export default settingSlice.reducer;
