/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Card, Dropdown, Form, Input, message } from "antd";
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

  return (
    <div className="space-y-6">
      {context}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="xl:col-span-1">
          <Card
            className="h-fit shadow-sm border-0"
            styles={{
              header: {
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              },
            }}
            title={
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">Profile Information</span>
              </div>
            }
          >
            <div className="text-center space-y-4">
              {/* Avatar Section */}
              <div className="relative inline-block">
                <Avatar
                  size={100}
                  src={
                    file
                      ? URL.createObjectURL(file)
                      : avatar
                      ? avatar
                      : AVATARDEFAULT
                  }
                  className="ring-4 ring-gray-100"
                />
                <div className="absolute -bottom-1 -right-1">
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
                              className="cursor-pointer flex items-center gap-2 py-1"
                            >
                              {auth.avatar ? (
                                <RiImageAiFill size={18} />
                              ) : (
                                <BiImageAdd size={18} />
                              )}
                              {auth.avatar ? "Change" : "Add"} Photo
                            </label>
                          ),
                        },
                        {
                          key: "remove",
                          label: (
                            <div
                              className={`text-red-500 flex items-center gap-2 py-1 ${
                                !auth.avatar ? "opacity-50" : ""
                              }`}
                            >
                              <FiTrash size={16} />
                              Remove Photo
                            </div>
                          ),
                          disabled: !auth.avatar,
                          onClick: () => {
                            setAvatar("");
                          },
                        },
                      ],
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<FiEdit3 />}
                      shape="circle"
                      className="shadow-lg"
                    />
                  </Dropdown>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {auth?.fullName || "User Name"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {auth?.email || "user@example.com"}
                </p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {auth?.role || "Admin"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Forms Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card
            className="shadow-sm border-0"
            styles={{
              header: {
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              },
            }}
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">
                    {isChangePassword ? "Change Password" : "Account Settings"}
                  </span>
                </div>
                <Button
                  type="text"
                  onClick={() => setIsChangePassword(!isChangePassword)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isChangePassword ? "← Back to Profile" : "Change Password"}
                </Button>
              </div>
            }
          >
            <div className="relative min-h-[300px]">
              {/* Profile Form */}
              <div
                className={`transition-all duration-300 ${
                  !isChangePassword
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <Form
                  name="user"
                  form={form}
                  size="large"
                  onFinish={handleEdit}
                  initialValues={auth}
                  layout="vertical"
                  className="space-y-4"
                >
                  <Form.Item
                    rules={rules}
                    label="Full Name"
                    name="fullName"
                    className="mb-6"
                  >
                    <Input
                      placeholder="Enter your full name"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    rules={rules}
                    label="Email Address"
                    name="email"
                    className="mb-6"
                  >
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item label="Role" name="role" className="mb-6">
                    <Input
                      placeholder="Your role"
                      disabled
                      className="rounded-lg bg-gray-50"
                    />
                  </Form.Item>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={!isChangePassword && isUpdating}
                      size="large"
                      className="px-8"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="default"
                      onClick={() => form.resetFields()}
                      size="large"
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Change Password Form */}
              <div
                className={`transition-all duration-300 ${
                  isChangePassword
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <Form
                  name="changePassword"
                  form={formChangePassword}
                  size="large"
                  onFinish={handleChangePassword}
                  layout="vertical"
                  className="space-y-4"
                >
                  <Form.Item
                    rules={rules}
                    label="Current Password"
                    name="password"
                    className="mb-6"
                  >
                    <Input.Password
                      placeholder="Enter your current password"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    rules={rules}
                    label="New Password"
                    name="newPassword"
                    className="mb-6"
                  >
                    <Input.Password
                      placeholder="Enter new password"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("The passwords do not match")
                          );
                        },
                      }),
                    ]}
                    label="Confirm New Password"
                    name="confirmPassword"
                    className="mb-6"
                  >
                    <Input.Password
                      placeholder="Confirm new password"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isChangePassword && isUpdating}
                      size="large"
                      className="px-8"
                    >
                      Update Password
                    </Button>
                    <Button
                      type="default"
                      onClick={() => {
                        setIsChangePassword(false);
                        formChangePassword.resetFields();
                      }}
                      size="large"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
