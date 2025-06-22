/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image, Upload } from "antd";
import { FaPlus } from "react-icons/fa6";
import { RiCloseFill } from "react-icons/ri";

interface Props {
  file?: any;
  local?: boolean;
  onDelete?: () => void;
  title?: string;
  onChange?: (e: any) => void;
  multiple?: boolean;
  fileList?: any[];
  onPreview?: (file: any) => void;
  previewFile?: any;
  previewOpen?: boolean;
  onChangePreview?: (visible: any) => void;
  onAfterChangePreview?: (visible: any) => void;
  icon?: React.ReactNode;
}

const UploadImage = (props: Props) => {
  const {
    file,
    onDelete,
    title,
    onChange,
    multiple,
    fileList,
    onPreview,
    previewFile,
    previewOpen,
    onAfterChangePreview,
    onChangePreview,
    icon,
    local,
  } = props;

  const renderButtonUpload = () => {
    return (
      <div className="flex flex-col items-center text-gray-400">
        {icon || <FaPlus size={20} />}
        <p>{title}</p>
      </div>
    );
  };

  const customRequest = (option: any) => {
    if (option.onSuccess) {
      option.onSuccess(option.file);
    }
    return option.file;
  };

  return (
    <div>
      {multiple ? (
        <>
          <Upload
            listType="picture-card"
            fileList={fileList}
            action={() => {
              return Promise.resolve("");
            }}
            onChange={onChange}
            customRequest={customRequest}
            onPreview={onPreview}
            multiple
          >
            {renderButtonUpload()}
          </Upload>

          {previewFile && (
            <Image
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: onChangePreview,
                afterOpenChange: onAfterChangePreview,
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
                  src={local ? URL.createObjectURL(file) : file}
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

export default UploadImage;
