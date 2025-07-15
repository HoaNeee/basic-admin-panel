/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image, Upload, type UploadFile } from "antd";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { RiCloseFill } from "react-icons/ri";

interface Props {
  file?: any;
  onDelete?: () => void;
  title?: string;
  onChange?: (e: any) => void;
  multiple?: boolean;
  fileList?: any[];
  icon?: React.ReactNode;
  maxCount?: number;
  defaultFileList?: any;
}

const UploadImagePreview = (props: Props) => {
  const {
    file,
    onDelete,
    title,
    onChange,
    multiple,
    fileList,
    icon,
    maxCount,
    defaultFileList,
  } = props;

  const [previewFile, setPreviewFile] = useState<any>();
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const renderButtonUpload = () => {
    return (
      <div className="flex flex-col items-center text-gray-400">
        {icon || <FaPlus size={20} />}
        <p>{title || "Upload"}</p>
      </div>
    );
  };

  const customRequest = (option: any) => {
    if (option.onSuccess) {
      option.onSuccess(option.file);
    }
    return option.file;
  };

  const handlePreviewImage = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      if (file.originFileObj) {
        file.preview = URL.createObjectURL(file.originFileObj);
      }
    }
    setPreviewFile(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  return (
    <div>
      {multiple ? (
        <>
          <Upload
            defaultFileList={defaultFileList}
            listType="picture-card"
            fileList={fileList}
            action={() => {
              return Promise.resolve("");
            }}
            onChange={onChange}
            customRequest={customRequest}
            onPreview={handlePreviewImage}
            multiple={multiple}
            maxCount={maxCount}
          >
            {renderButtonUpload()}
          </Upload>

          {previewFile && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (open) => {
                  if (!open) setPreviewOpen(false);
                },
              }}
              src={previewFile}
            />
          )}
        </>
      ) : (
        <>
          {file && (
            <div className="text-center my-2">
              <div className="w-66 h-50 mx-auto relative">
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
              <Button type="link" size="small">
                <label htmlFor="thumbnail">{title || "Choose file"}</label>
              </Button>

              <div className="hidden">
                <input
                  type="file"
                  accept="image/*"
                  id="thumbnail"
                  onChange={onChange}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadImagePreview;
