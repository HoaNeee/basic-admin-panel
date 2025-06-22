/* eslint-disable @typescript-eslint/no-explicit-any */

import axiosClient from "./axiosClient";

export const handleAPI = async (
  url: string,
  options?: unknown,
  method?: "post" | "get" | "patch" | "delete"
) => {
  return await axiosClient(url, {
    method: method ? method : "get",
    data: options,
  });
};

export const uploadImage = async (keyName: string, options: any) => {
  const data: any = {};
  data[`${keyName}`] = options;
  return await axiosClient.post("/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadImageMulti = async (keyName: string, options: any) => {
  const formdata = new FormData();
  for (const file of options) {
    formdata.append(`${keyName}`, file);
  }
  return await axiosClient.post("/upload/multi", formdata, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: true,
    },
  });
};
