/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Image } from "antd";
import { RiCloseFill } from "react-icons/ri";

interface Props {
  file?: any;
  onDelete?: () => void;
  title?: string;
  onChange?: (e: any) => void;
}

const UploadImage = (props: Props) => {
  const { file, onDelete, title, onChange } = props;

  return (
    <div>
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
    </div>
  );
};

export default UploadImage;
