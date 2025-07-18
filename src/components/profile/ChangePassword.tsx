/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Input, message, Space } from "antd";
import { rules } from "../../helpers/rulesGeneral";
import { useState } from "react";
import { handleAPI } from "../../apis/request";
import { useNavigate } from "react-router";

const ChangePassword = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const [formChangePassword] = Form.useForm();
  const [messApi, context] = message.useMessage();
  const navigate = useNavigate();

  const handleChangePassword = async (values: any) => {
    try {
      setIsUpdating(true);
      const response: any = await handleAPI(
        "/auth/profile/change-password",
        values,
        "patch"
      );

      messApi.success(response.message);
      formChangePassword.resetFields();
      navigate("/profile");
    } catch (error: any) {
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
          name="changePassword"
          form={formChangePassword}
          size="large"
          onFinish={handleChangePassword}
        >
          <Form.Item rules={rules} label="Current Password" name={"password"}>
            <Input
              placeholder="Your Current Password"
              type="password"
              name="password"
            />
          </Form.Item>
          <Form.Item rules={rules} label="New Password" name={"newPassword"}>
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
        <Space className="mt-6">
          <Button onClick={() => navigate("/profile")} type={"default"}>
            {"Cancel"}
          </Button>
          <Button
            loading={isUpdating}
            type={"primary"}
            onClick={() => formChangePassword.submit()}
          >
            Change Password
          </Button>
        </Space>
      </div>
    </>
  );
};

export default ChangePassword;
