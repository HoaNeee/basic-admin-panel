/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Flex,
  Form,
  Input,
  message,
} from "antd";
import AVATARDEFAULT from "../assets/avatarNotFound.jpg";
import { handleAPI } from "../apis/request";
import { useEffect, useRef, useState } from "react";
import type { AuthState } from "../redux/reducers/authReducer";
import { FiEdit3, FiTrash } from "react-icons/fi";
import { rules } from "../helpers/rulesGeneral";
import { BiImageAdd } from "react-icons/bi";

const Profile = () => {
  const [user, setUser] = useState<AuthState>();

  const [form] = Form.useForm();
  const [messApi, context] = message.useMessage();
  const [file, setFile] = useState<File>();

  const fileRef = useRef(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const api = `/auth/profile`;
      const response = await handleAPI(api);
      setUser(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (values: any) => {
    try {
      delete values.role;
      console.log(values);
    } catch (error: any) {
      console.log(error);
      messApi.error(error.message);
    }
  };

  return (
    <>
      {context}
      <div className="h-full p-8">
        <Card className="h-full">
          <Flex justify="space-between" align="center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  size={76}
                  src={
                    file
                      ? URL.createObjectURL(file)
                      : user?.avatar
                      ? user.avatar
                      : AVATARDEFAULT
                  }
                />
                <div className="absolute bottom-0 right-0">
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    id="picker-avatar"
                    onChange={(e) => {
                      if (e?.target?.files) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "add",
                          label: (
                            <label
                              htmlFor="picker-avatar"
                              className="cursor-pointer"
                            >
                              Add Image
                            </label>
                          ),
                          icon: <BiImageAdd size={18} />,
                        },
                        {
                          key: "remove",
                          label: <p className="text-red-500">Remove</p>,
                          icon: <FiTrash size={18} color="red" />,
                        },
                      ],
                    }}
                    popupRender={(menu) => {
                      return <div className="">{menu}</div>;
                    }}
                    trigger={["click"]}
                  >
                    <Button
                      type="default"
                      size="small"
                      icon={<FiEdit3 />}
                      shape="circle"
                    />
                  </Dropdown>
                </div>
              </div>
              <div className="">
                <p className="font-semibold">{user?.fullName || "User"}</p>
                <p className="text-gray-400">
                  {user?.email || "example@gmail.com"}
                </p>
              </div>
            </div>
            <div>
              <Button onClick={() => form.submit()} type="primary">
                Edit Profile
              </Button>
            </div>
          </Flex>
          <div className="mt-10 max-w-lg">
            <Form name="user" form={form} size="large" onFinish={handleEdit}>
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
            <Button type="primary" className="mt-6">
              Change Password
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Profile;
