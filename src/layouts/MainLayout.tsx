import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router";
import SiderComponent from "../components/SiderComponent";
import HeaderComponent from "../components/HeaderComponent";
import { useDispatch } from "react-redux";
import { appName } from "../constants/appName";
import { removeAuth } from "../redux/reducers/authReducer";
import { useEffect, useState } from "react";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const auth = localStorage.getItem(appName.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = window.innerWidth < 992;
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [collapsed]);

  useEffect(() => {
    const removeUser = () => {
      navigate("/");
      dispatch(removeAuth());
    };

    if (!auth) {
      removeUser();
    } else {
      const authParse = JSON.parse(auth);
      if (!authParse.accessToken) {
        removeUser();
      }
    }
  }, [auth, navigate, dispatch]);

  return (
    <Layout
      className="w-full relative min-h-screen"
      style={{
        minHeight: "100vh",
      }}
    >
      <SiderComponent collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout className="lg:ml-0">
        <HeaderComponent collapsed={collapsed} onCollapse={setCollapsed} />
        <Content className="p-1 lg:p-4 bg-gray-100 min-h-[calc(100vh-64px)]">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
