import axios from "axios";
import queryString from "query-string";
import { appName } from "../constants/appName";

export const DOMAIN =
  import.meta.env.VITE_ENV === "dev"
    ? "http://localhost:3001"
    : "https://api2.kakrist.site";

const BASE_URL = `${DOMAIN}/admin`;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(
  async (config) => {
    const auth = localStorage.getItem(appName.auth);
    let accessToken = "";
    if (auth) {
      accessToken = JSON.parse(auth).accessToken;
    }
    config.headers.Authorization = `Bearer ${accessToken}`;

    if (!(config.data instanceof FormData)) {
      config.data = {
        ...config.data,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  async (response) => {
    if (!response.data || response.data.code > 300) {
      //token expired
      if (response.data.code === 402) {
        console.log("need refresh token");
        let refreshToken = "";
        const auth = localStorage.getItem(appName.auth);

        if (!auth) {
          return Promise.reject(response.data);
        }
        refreshToken = JSON.parse(auth).refreshToken;
        const res = await axios.get(BASE_URL + "/auth/refresh-token", {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        if (!res || res.data.code > 300) {
          localStorage.clear();
          window.location.href = "/";
          return Promise.reject(res.data);
        }
        const data = {
          accessToken: res.data.accessToken,
          refreshToken: refreshToken,
        };

        localStorage.setItem(appName.auth, JSON.stringify(data));
        return axiosClient(response.config);
      }
      return Promise.reject(response.data);
    }

    return response.data;
  },
  (error) => {
    return Promise.reject(error?.response?.data || error);
  }
);

export default axiosClient;
