/* eslint-disable @typescript-eslint/no-explicit-any */
import LogoApp from "../../assets/logo.png";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { Link, useNavigate } from "react-router";
import { handleAPI } from "../../apis/request";
import { useDispatch } from "react-redux";
import { addAuth } from "../../redux/reducers/authReducer";
import SocialLogin from "../../components/SocialLogin";
import { useState } from "react";

const Login = () => {
  const [isRemember, setIsRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = useForm();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleLogin = async (values: {
    email: string;
    password: string;
    isRemember: boolean;
  }) => {
    try {
      values.isRemember = isRemember;
      setIsLoading(true);
      const response = await handleAPI("/auth/login", values, "post");
      message.success("Login successfully!");
      navigate("/");
      dispatch(addAuth(response.data));
    } catch (error: any) {
      console.log(error);
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const rules = (
    name: string
  ): {
    required: boolean;
    message: string;
  } => {
    return {
      required: true,
      message: `Please enter ${name}!!`,
    };
  };

  return (
    <>
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="flex flex-col gap-1 w-full items-center justify-center">
          <img
            src={LogoApp}
            alt=""
            className="w-[70px] h-[70px] object-cover"
          />
          <h3 className="text-3xl font-semibold">Log in to your account</h3>
          <p className="text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>
        <div className="w-4/7 mt-4">
          <div>
            <Form
              name="login"
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              size="large"
            >
              <Form.Item label="Email" name={"email"} rules={[rules("email")]}>
                <Input allowClear placeholder="Enter your email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name={"password"}
                rules={[rules("password")]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>
            </Form>
          </div>
          <div className="flex justify-between">
            <Checkbox
              checked={isRemember}
              onChange={(e) => setIsRemember(e.target.checked)}
            >
              Remmember
            </Checkbox>
            <p className="text-sm text-primary font-medium">Forgot password</p>
          </div>
          <Button
            loading={isLoading}
            onClick={() => form.submit()}
            className="my-3"
            size="large"
            style={{
              width: "100%",
            }}
            type="primary"
          >
            Sign in
          </Button>
          <SocialLogin />
          <p className="text-center mt-3 text-gray-400">
            Don't have an account?{" "}
            <Link to={"/register"} className="text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
