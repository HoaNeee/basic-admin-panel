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

const HeaderComponent = () => {
  const auth = useSelector((state: RootState) => state.auth.auth);

  const dispatch = useDispatch();

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
                content={<div className="min-h-80 min-w-90">Content</div>}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Badge count={1} className="" size="small">
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
