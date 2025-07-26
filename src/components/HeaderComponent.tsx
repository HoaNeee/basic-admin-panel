import {
  Avatar,
  Badge,
  Dropdown,
  Flex,
  Input,
  notification,
  Popover,
  Space,
  Button,
} from "antd";
import { Header } from "antd/es/layout/layout";
import { IoSearchOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router";
import { PiUser } from "react-icons/pi";
import { RxExit } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { removeAuth } from "../redux/reducers/authReducer";
import AVATARDEFAULT from "../assets/avatarNotFound.jpg";
import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import NotificationComponent from "./NotificationComponent";
import type { NotificationModel } from "../models/notificationModel";
import { socket } from "../socket/socket";

interface HeaderComponentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  collapsed,
  onCollapse,
}) => {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [readLength, setReadLength] = useState(0);

  const auth = useSelector((state: RootState) => state.auth.auth);
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();

    getNotification();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("SERVER_RETURN_NEW_ORDER", (data) => {
      setReadLength((prev) => prev + 1);
      setNotifications((prev) => [...prev, data]);
      api.info({
        message: "Notification",
        description: data.message,
        placement: "topRight",
        showProgress: true,
        pauseOnHover: true,
        icon: <BellOutlined className="text-xl" />,
        onClick: () => {
          navigate(data.ref_link);
        },
      });
    });

    return () => {
      socket.off("SERVER_RETURN_NEW_ORDER");
    };
  }, [api, navigate]);

  const getNotification = async () => {
    try {
      const api = `/notifications`;
      const response = await handleAPI(api);
      const data: NotificationModel[] = response.data.notifications;
      setNotifications(data);
      setReadLength(data.filter((item) => !item.isRead).length);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {contextHolder}
      <Header className="header-component">
        <Flex justify="space-between" align="center" className="w-full">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            {/* Collapse Button */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => onCollapse(!collapsed)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex-shrink-0"
              size="large"
            />

            {/* Search Input */}
            <div className="flex-1 max-w-56 sm:max-w-lg">
              <Input
                prefix={<IoSearchOutline />}
                placeholder="Search..."
                size="large"
                className="shadow-sm w-full"
              />
            </div>
          </div>
          <Space size={33}>
            <div className="relative w-fit h-fit">
              <div className="absolute flex items-center justify-center w-full h-full">
                <Popover
                  styles={{
                    body: {
                      padding: "10px 0px 10px 10px",
                    },
                  }}
                  className="bg-gray-100/30"
                  forceRender
                  content={
                    <div
                      className={`lg:w-96 w-70 bg-white  ${
                        notifications.length > 0
                          ? "h-90 overflow-hidden"
                          : "min-h-80"
                      }`}
                    >
                      <NotificationComponent
                        notifications={notifications}
                        onRead={(id) => {
                          const items = [...notifications];
                          const index = items.findIndex(
                            (item) => item._id === id
                          );
                          if (index !== -1) {
                            items[index].isRead = true;
                            setNotifications(items);
                            setReadLength(Math.max(0, readLength - 1));
                          }
                        }}
                      />
                    </div>
                  }
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Badge count={readLength} className="" size="small">
                    <BellOutlined className="text-xl" />
                  </Badge>
                </Popover>
              </div>
            </div>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: (
                      <Link
                        className="flex items-center gap-2 py-1 px-2"
                        to={"/profile"}
                      >
                        <PiUser size={20} />
                        Profile
                      </Link>
                    ),
                  },
                  {
                    key: "logout",
                    label: (
                      <div
                        className="flex items-center gap-2 py-1 px-2 text-red-500"
                        onClick={() => {
                          localStorage.clear();
                          dispatch(removeAuth());
                        }}
                      >
                        <RxExit size={20} />
                        Logut
                      </div>
                    ),
                  },
                ],
              }}
              popupRender={(menu) => {
                return <div className="flex flex-col gap-2">{menu}</div>;
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Avatar src={auth.avatar || AVATARDEFAULT} />
            </Dropdown>
          </Space>
        </Flex>
      </Header>
    </>
  );
};

export default HeaderComponent;
