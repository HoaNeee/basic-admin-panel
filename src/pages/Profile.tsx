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
  Space,
} from "antd";
import AVATARDEFAULT from "../assets/avatarNotFound.jpg";
import { handleAPI, uploadImage } from "../apis/request";
import { useEffect, useRef, useState } from "react";
import { updateOnlyAuthData } from "../redux/reducers/authReducer";
import { FiEdit3, FiTrash } from "react-icons/fi";
import { rules } from "../helpers/rulesGeneral";
import { BiImageAdd } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { RiImageAiFill } from "react-icons/ri";

const Profile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [file, setFile] = useState<File>();
  const [avatar, setAvatar] = useState("");
  const [isChangePassword, setIsChangePassword] = useState(false);

  const [form] = Form.useForm();
  const [formChangePassword] = Form.useForm();
  const [messApi, context] = message.useMessage();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth.auth);

  useEffect(() => {
    if (auth.avatar) {
      setAvatar(auth.avatar);
    }
  }, [auth.avatar]);

  const fileRef = useRef<any>(null);

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

  const handleChangePassword = async (values: any) => {
    try {
      setIsUpdating(true);
      const response: any = await handleAPI(
        "/auth/profile/change-password",
        values,
        "patch"
      );

      messApi.success(response.message);
      setIsChangePassword(false);
      formChangePassword.resetFields();
    } catch (error: any) {
      messApi.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderButton = () => {
    return (
      <Space className="mt-6">
        <Button
          loading={!isChangePassword && isUpdating}
          onClick={() => {
            if (isChangePassword) {
              setIsChangePassword(false);
            } else {
              form.submit();
            }
          }}
          type={isChangePassword ? "default" : "primary"}
        >
          {isChangePassword ? "Cancel" : "Edit Profile"}
        </Button>
        <Button
          loading={isChangePassword && isUpdating}
          type={isChangePassword ? "primary" : "default"}
          onClick={() => {
            if (!isChangePassword) {
              setIsChangePassword(true);
            } else {
              formChangePassword.submit();
            }
          }}
        >
          Change Password
        </Button>
      </Space>
    );
  };

  return (
    <>
      {context}
      <div className="h-full p-8 relative">
        <Card className="h-full">
          <Flex justify="space-between" align="center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  size={76}
                  src={
                    file
                      ? URL.createObjectURL(file)
                      : avatar
                      ? avatar
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
                    accept="image/*"
                  />
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "add",
                          label: (
                            <label
                              htmlFor="picker-avatar"
                              className="cursor-pointer flex items-center gap-2"
                            >
                              {auth.avatar ? (
                                <RiImageAiFill size={18} />
                              ) : (
                                <BiImageAdd size={18} />
                              )}
                              {auth.avatar ? "Edit" : "Add"} Image
                            </label>
                          ),
                        },
                        {
                          key: "remove",
                          label: (
                            <p
                              className={`text-red-500 ${
                                !auth.avatar ? "opacity-50" : ""
                              }`}
                            >
                              Remove
                            </p>
                          ),
                          icon: (
                            <FiTrash
                              className={`${!auth.avatar ? "opacity-50" : ""}`}
                              size={18}
                              color="red"
                            />
                          ),
                          disabled: !auth.avatar,
                          onClick: () => {
                            setAvatar("");
                          },
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
                <p className="font-semibold">{auth?.fullName || "User"}</p>
                <p className="text-gray-400">
                  {auth?.email || "example@gmail.com"}
                </p>
              </div>
            </div>
          </Flex>
          <div className="mt-10 transition-all duration-300 max-w-xl relative">
            <div
              className={`transition-all duration-300 absolute top-0 w-full`}
              style={{
                opacity: !isChangePassword ? "1" : "0",
                pointerEvents: isChangePassword ? "none" : "auto",
              }}
            >
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
              {renderButton()}
            </div>

            <div
              className={`transition-all duration-300 absolute top-0 w-full`}
              style={{
                opacity: isChangePassword ? "1" : "0",
                pointerEvents: !isChangePassword ? "none" : "auto",
              }}
            >
              <Form
                name="changePassword"
                form={formChangePassword}
                size="large"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  rules={rules}
                  label="Current Password"
                  name={"password"}
                >
                  <Input
                    placeholder="Your Current Password"
                    type="password"
                    name="password"
                  />
                </Form.Item>
                <Form.Item
                  rules={rules}
                  label="New Password"
                  name={"newPassword"}
                >
                  <Input placeholder="Enter New Password" type="password" />
                </Form.Item>
                <Form.Item
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The confirm password do not match")
                        );
                      },
                    }),
                  ]}
                  label="Confirm Password"
                  name={"confirmPassword"}
                >
                  <Input placeholder="Enter Password" type="password" />
                </Form.Item>
              </Form>
              {renderButton()}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Profile;
