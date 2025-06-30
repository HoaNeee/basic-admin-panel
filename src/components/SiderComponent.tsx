import { Menu, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation } from "react-router";
import { RiHome5Line } from "react-icons/ri";
import { MdOutlineInventory2 } from "react-icons/md";
import { MdOutlineInsertChart } from "react-icons/md";
import { LuCircleUserRound } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import Logo from "../assets/logo.png";
import { TiTags } from "react-icons/ti";
import { appName } from "../constants/appName";
import { RiDiscountPercentLine } from "react-icons/ri";

const items: MenuProps["items"] = [
  {
    key: "/",
    label: (
      <Link to={"/"} className="font-medium">
        Dashboard
      </Link>
    ),
    icon: <RiHome5Line size={20} />,
  },

  {
    key: "inventories",
    label: (
      <>
        <p className="font-medium">Inventories</p>
      </>
    ),
    icon: <MdOutlineInventory2 size={20} />,

    children: [
      {
        type: "divider",
      },
      {
        key: "/inventories",
        label: (
          <Link to={"/inventories"} className={"font-medium"}>
            Inventory
          </Link>
        ),
      },
      {
        key: "/inventories/add-new-product",
        label: (
          <>
            <Link to={"inventories/add-new-product"} className="font-medium">
              Add product
            </Link>
          </>
        ),
        type: "item",
      },
      {
        key: "/inventories/variations",
        label: (
          <>
            <Link to={"inventories/variations"} className="font-medium">
              Variations
            </Link>
          </>
        ),
        type: "item",
      },
    ],
  },

  {
    key: "/categories",
    label: (
      <Link to={"/categories"} className="font-medium">
        Categories
      </Link>
    ),
    icon: <TiTags size={20} />,
  },
  {
    key: "/reports",
    label: (
      <Link to={"/reports"} className="font-medium">
        Reports
      </Link>
    ),
    icon: <MdOutlineInsertChart size={20} />,
  },
  {
    key: "/suppliers",
    label: (
      <Link to={"/suppliers"} className="font-medium">
        Suppliers
      </Link>
    ),
    icon: <LuCircleUserRound size={20} />,
  },
  {
    key: "/orders",
    label: (
      <Link to={"/orders"} className="font-medium">
        Orders
      </Link>
    ),
    icon: <BsBoxSeam size={20} />,
  },
  {
    key: "/manage-store",
    label: (
      <Link to={"/manage-store"} className="font-medium">
        Manage Store
      </Link>
    ),
    icon: <LuClipboardList size={20} />,
  },
  {
    key: "/promotions",
    label: (
      <Link to={"/promotions"} className="font-medium">
        Promotions
      </Link>
    ),
    icon: <RiDiscountPercentLine size={20} />,
  },
];

const SiderComponent = () => {
  const location = useLocation();

  return (
    <Sider
      theme="light"
      className="h-screen"
      style={{
        width: "25%",
        borderRight: "1px solid #ddd",
        position: "fixed",
        top: 0,
        bottom: 0,
      }}
    >
      <div className="flex w-full items-center ml-2 py-2">
        <div className="w-[52px] h-[52px]">
          <img src={Logo} alt="" />
        </div>
        <p className="text-primary font-bold text-lg">
          {appName.appConstantname}
        </p>
      </div>
      <Menu
        items={items}
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        defaultOpenKeys={["/inventories"]}
      />
    </Sider>
  );
};

export default SiderComponent;
