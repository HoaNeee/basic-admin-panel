import { Menu, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation, useNavigate } from "react-router";
import { RiBillLine, RiHome5Line } from "react-icons/ri";
import { MdOutlineInventory2, MdOutlineRateReview } from "react-icons/md";
import { MdOutlineInsertChart } from "react-icons/md";
import { LuCircleUserRound } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import Logo from "../assets/logo.png";
import { TiTags } from "react-icons/ti";
import { appName } from "../constants/appName";
import { RiDiscountPercentLine } from "react-icons/ri";
import { PiUsersThree } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";

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
    label: <p className="font-medium">Inventories</p>,
    icon: <MdOutlineInventory2 size={20} />,
    children: [
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
          <Link to={"inventories/add-new-product"} className="font-medium">
            Add product
          </Link>
        ),
        type: "item",
      },
      {
        key: "/inventories/variations",
        label: (
          <Link to={"inventories/variations"} className="font-medium">
            Variations
          </Link>
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
    key: "/sale-orders",
    label: (
      <Link to={"/sale-orders"} className="font-medium">
        Sale Orders
      </Link>
    ),
    icon: <RiBillLine size={20} />,
  },
  {
    key: "purchase-orders",
    label: <p className="font-medium">Purchase</p>,
    icon: <BsBoxSeam size={20} />,
    children: [
      {
        key: "/purchase-orders",
        label: (
          <Link to={"/purchase-orders"} className="font-medium">
            All
          </Link>
        ),
      },
      {
        key: "/purchase-orders/add-purchase-order",
        label: (
          <Link
            to={"/purchase-orders/add-purchase-order"}
            className="font-medium"
          >
            New Order
          </Link>
        ),
      },
    ],
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
  {
    key: "/customers",
    label: (
      <Link to={"/customers"} className="font-medium">
        Customers
      </Link>
    ),
    icon: <PiUsersThree size={20} />,
  },
  {
    key: "/reviews",
    label: (
      <Link to={"/reviews"} className="font-medium">
        Reviews
      </Link>
    ),
    icon: <MdOutlineRateReview size={20} />,
  },
];

const SiderComponent = () => {
  const location = useLocation();

  const pathName = location.pathname;

  const keyOpen =
    pathName.substring(1).substring(0, pathName.substring(1).indexOf("/")) ||
    pathName.substring(1);

  const navigate = useNavigate();

  return (
    <Sider
      theme="light"
      className="h-screen"
      style={{
        borderRight: "1px solid #ddd",
        position: "sticky",
        top: 0,
        bottom: 0,
        left: 0,
      }}
      width={230}
    >
      <div className="flex flex-col w-full justify-between h-full overflow-x-hidden overflow-y-auto">
        <div className="space-y-3">
          <Link to={"/"} className="flex w-full items-center ml-2 py-2">
            <div className="w-[52px] h-[52px]">
              <img src={Logo} alt="" />
            </div>
            <p className="text-primary font-bold text-lg">
              {appName.appConstantname}
            </p>
          </Link>
          <Menu
            items={items}
            mode="inline"
            defaultSelectedKeys={[pathName]}
            defaultOpenKeys={[keyOpen]}
            selectedKeys={[pathName, keyOpen]}
          />
        </div>
        <div className="w-full px-2 mb-2">
          <div
            className="flex items-center rounded-lg cursor-pointer transition-color duration-400 gap-2 py-3 px-7 hover:bg-[#fcede6] hover:text-[#f15e2b]"
            style={{
              backgroundColor: pathName === "/setting" ? "#fcede6" : "",
              color: pathName === "/setting" ? "#f1522b" : "",
            }}
            onClick={() => {
              navigate("/setting");
            }}
          >
            <IoSettingsOutline size={20} />
            <p className="font-medium opacity-80">Settings</p>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default SiderComponent;
