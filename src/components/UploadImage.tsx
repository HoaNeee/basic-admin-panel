/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image } from "antd";
import React from "react";
import { RiCloseFill } from "react-icons/ri";

interface Props {
  file?: any;
  onDelete?: () => void;
  title?: string | React.ReactNode;
  onChange?: (e: any) => void;
  size?: "small" | "large" | "default";
  customButtonUpload?: React.ReactNode;
  className?: string;
  styles?: React.CSSProperties;
  id?: string;
}

const UploadImage = (props: Props) => {
  const {
    file,
    onDelete,
    title,
    onChange,
    size = "default",
    customButtonUpload,
    className,
    styles,
    id = `thumbnail-${Date.now()}-${Math.random()}`,
  } = props;

  return (
    <div>
      {file && (
        <div className="text-center my-2">
          <div
            className={`mx-auto relative ${
              size === "default"
                ? "w-66 h-50"
                : size === "small"
                ? "w-32 h-24"
                : "w-72 h-60"
            } ${className}`}
            style={styles}
          >
            <Image
              src={file}
              width={"100%"}
              height={"100%"}
              style={{
                objectFit: "cover",
              }}
              className="relative block"
            ></Image>
            <div
              className="absolute -top-2 -right-2 cursor-pointer z-10 bg-gray-500 rounded-full "
              onClick={onDelete}
            >
              <RiCloseFill size={25} color="#fff" />
            </div>
          </div>
        </div>
      )}
      {!file && (
        <div>
          {customButtonUpload ? (
            <label htmlFor={id} className="inline-block">
              {customButtonUpload}
            </label>
          ) : (
            <Button type="link" size="small">
              <label htmlFor={id}>{title || "Choose file"}</label>
            </Button>
          )}

          <div className="hidden">
            <input type="file" accept="image/*" id={id} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImage;
