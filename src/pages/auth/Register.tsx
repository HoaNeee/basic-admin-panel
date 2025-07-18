import LogoApp from "../../assets/logo.png";
import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { Link, useNavigate } from "react-router";
import { handleAPI } from "../../apis/request";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addAuth } from "../../redux/reducers/authReducer";
import SocialLogin from "../../components/SocialLogin";

const Register = () => {
  const [form] = useForm();

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await handleAPI("/auth/register", values, "post");

      navigate("/");
      dispatch(addAuth(response.data));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const rule = (
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
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="flex flex-col gap-1 w-full items-center justify-center">
        <img src={LogoApp} alt="" className="w-[70px] h-[70px] object-cover" />
        <h3 className="text-3xl font-semibold">Create an account</h3>
        <p className="text-gray-500">Start your 30-day free trial.</p>
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
            <Form.Item label="Name" name={"fullName"} rules={[rule("name")]}>
              <Input allowClear placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Email" name={"email"} rules={[rule("email")]}>
              <Input allowClear placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name={"password"}
              rules={[rule("password")]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
          </Form>
        </div>

        <Button
          loading={isLoading}
          color="danger"
          onClick={() => form.submit()}
          className="my-3"
          size="large"
          style={{
            width: "100%",
          }}
          type="primary"
        >
          Get started
        </Button>
        <SocialLogin />
        <p className="text-center mt-3 text-gray-400">
          Already have an account?{" "}
          <Link to={"/login"} className="text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
