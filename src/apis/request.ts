/* eslint-disable @typescript-eslint/no-explicit-any */

import axiosClient from "./axiosClient";
import Resizer from "react-image-file-resizer";

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

export const uploadImage = async (
  keyName: string,
  options: any,
  resize = true
) => {
  const formData = new FormData();
  const newFile = resize ? await resizeFile(options) : options;
  if (newFile instanceof File) {
    formData.append(`${keyName}`, newFile);
  }
  return await axiosClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: true,
    },
  });
};

export const uploadImageMulti = async (keyName: string, options: any) => {
  const formdata = new FormData();
  for (const file of options) {
    const newFile: any = await resizeFile(file);
    formdata.append(`${keyName}`, newFile);
  }
  return await axiosClient.post("/upload/multi", formdata, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: true,
    },
  });
};

const resizeFile = (file: any) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      1024,
      720,
      "JPEG,PNG",
      80,
      0,
      (uri) => {
        resolve(uri);
      },
      "file"
    );
  });
