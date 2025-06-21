import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router";
import SiderComponent from "../components/SiderComponent";
import HeaderComponent from "../components/HeaderComponent";
import { useDispatch } from "react-redux";
import { appName } from "../constants/appName";
import { removeAuth } from "../redux/reducers/authReducer";
import { useEffect } from "react";
import Sider from "antd/es/layout/Sider";

const MainLayout = () => {
  const auth = localStorage.getItem(appName.auth);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const removeUser = () => {
    navigate("/");
    dispatch(removeAuth());
  };

  useEffect(() => {
    if (!auth) {
      removeUser();
    } else {
      const authParse = JSON.parse(auth);
      if (!authParse.accessToken) {
        removeUser();
      }
    }
  }, [auth]);
  return (
    <Layout
      className="w-full relative"
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider>
        <SiderComponent />
      </Sider>
      <Layout className="">
        <HeaderComponent />
        <Content className="p-3">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
