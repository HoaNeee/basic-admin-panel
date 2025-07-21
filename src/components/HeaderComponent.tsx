import { Avatar, Badge, Dropdown, Flex, Input, Popover, Space } from "antd";
import { Header } from "antd/es/layout/layout";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router";
import { PiUser } from "react-icons/pi";
import { RxExit } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { removeAuth } from "../redux/reducers/authReducer";
import AVATARDEFAULT from "../assets/avatarNotFound.jpg";
import { BellOutlined } from "@ant-design/icons";
import type { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import NotificationComponent from "./NotificationComponent";
import type { NotificationModel } from "../models/notificationModel";

const HeaderComponent = () => {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [readLength, setReadLength] = useState(0);

  const auth = useSelector((state: RootState) => state.auth.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    getNotification();
  }, []);

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
    <Header
      style={{
        backgroundColor: "white",
        position: "sticky",
        top: 0,
        zIndex: 30,
        width: "100%",
      }}
    >
      <Flex justify="space-between">
        <div className="w-1/3">
          <Input
            prefix={<IoSearchOutline />}
            placeholder="Search product, supplier, order"
            size="large"
          />
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
                    className={`w-96  ${
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
  );
};

export default HeaderComponent;
