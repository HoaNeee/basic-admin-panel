/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, message, Space } from "antd";
import { rules } from "../../helpers/rulesGeneral";
import { useEffect, useRef, useState } from "react";
import { handleAPI, uploadImage } from "../../apis/request";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { updateOnlyAuthData } from "../../redux/reducers/authReducer";
import { Link } from "react-router";

const ProfileComponent = () => {
  const [avatar, setAvatar] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [file, setFile] = useState<File>();

  const [form] = Form.useForm();
  const [messApi, context] = message.useMessage();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.auth);
  const fileRef = useRef<any>(null);

  useEffect(() => {
    if (auth.avatar) {
      setAvatar(auth.avatar);
    }
  }, [auth.avatar]);

  const handleEdit = async (values: any) => {
    try {
      setIsUpdating(true);
      delete values.role;
      if (file) {
        const responseUrl = await uploadImage("thumbnail", file);
        values.avatar = responseUrl.data;
      }

      if (auth.avatar && !avatar) {
        values.avatar = "";
      }

      const response: any = await handleAPI(
        "/auth/profile/edit",
        values,
        "patch"
      );
      if (fileRef.current) {
        fileRef.current.value = "";
        fileRef.current.files = null;
      }
      setFile(undefined);
      messApi.success(response.message);
      dispatch(updateOnlyAuthData(values));
    } catch (error: any) {
      console.log(error);
      messApi.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {context}
      <div className={`transition-all duration-300 absolute top-0 w-full`}>
        <Form
          name="user"
          form={form}
          size="large"
          onFinish={handleEdit}
          initialValues={auth}
        >
          <Form.Item rules={rules} label="Full Name" name={"fullName"}>
            <Input placeholder="Your Full Name" />
          </Form.Item>
          <Form.Item rules={rules} label="Email" name={"email"}>
            <Input placeholder="Your Email" />
          </Form.Item>
          <Form.Item rules={rules} label="Role" name={"role"}>
            <Input placeholder="Your Role" disabled />
          </Form.Item>
        </Form>
        <Space className="mt-6">
          <Button
            loading={isUpdating}
            onClick={() => form.submit()}
            type={"primary"}
          >
            Edit Profile
          </Button>
          <Link to={"/profile/change-password"}>
            <Button type={"default"}>Change Password</Button>
          </Link>
        </Space>
      </div>
    </>
  );
};

export default ProfileComponent;
