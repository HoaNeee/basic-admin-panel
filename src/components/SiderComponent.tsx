import { Menu, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, useLocation, useNavigate } from "react-router";
import { RiBillLine, RiHome5Line, RiMailAiLine } from "react-icons/ri";
import { MdOutlineRateReview } from "react-icons/md";
import { MdOutlineInsertChart } from "react-icons/md";
import { LuCircleUserRound, LuMessageCircleReply } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import Logo from "../assets/logo.png";
import { TiTags } from "react-icons/ti";
import { appName } from "../constants/appName";
import { RiDiscountPercentLine } from "react-icons/ri";
import { PiUsersThree } from "react-icons/pi";
import { IoSettingsOutline, IoTrashOutline } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { ImBlog } from "react-icons/im";
import { FiShoppingBag } from "react-icons/fi";
import styles from "../assets/css/SiderComponent.module.css";

interface SiderComponentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

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
    key: "products-group",
    label: "Product Management",
    type: "group",
  },
  {
    key: "inventories",
    label: "Products",
    icon: <FiShoppingBag size={20} />,
    children: [
      {
        key: "/inventories",
        label: (
          <Link to={"/inventories"} className={"font-medium"}>
            All Products
          </Link>
        ),
      },
      {
        key: "/inventories/add-new-product",
        label: (
          <Link to={"inventories/add-new-product"} className="font-medium">
            Add New Product
          </Link>
        ),
      },
      {
        key: "/inventories/variations",
        label: (
          <Link to={"inventories/variations"} className="font-medium">
            Product Variations
          </Link>
        ),
      },
      {
        key: "/inventories/embedding",
        label: (
          <Link to={"inventories/embedding"} className="font-medium">
            AI Search Setup
          </Link>
        ),
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
    key: "orders-group",
    label: "Order Management",
    type: "group",
  },
  {
    key: "/sale-orders",
    label: (
      <Link to={"/sale-orders"} className="font-medium">
        Customer Orders
      </Link>
    ),
    icon: <RiBillLine size={20} />,
  },
  {
    key: "purchase-orders",
    label: "Purchase Orders",
    icon: <BsBoxSeam size={20} />,
    children: [
      {
        key: "/purchase-orders",
        label: (
          <Link to={"/purchase-orders"} className="font-medium">
            All Purchase Orders
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
            Create New Order
          </Link>
        ),
      },
    ],
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
    key: "analytics-group",
    label: "Analytics & Reports",
    type: "group",
  },
  {
    key: "/reports",
    label: (
      <Link to={"/reports"} className="font-medium">
        Business Reports
      </Link>
    ),
    icon: <MdOutlineInsertChart size={20} />,
  },

  {
    key: "marketing-group",
    label: "Marketing",
    type: "group",
  },
  {
    key: "/promotions",
    label: (
      <Link to={"/promotions"} className="font-medium">
        Promotions & Discounts
      </Link>
    ),
    icon: <RiDiscountPercentLine size={20} />,
  },

  {
    key: "customer-group",
    label: "Customer Relations",
    type: "group",
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
        Customer Reviews
      </Link>
    ),
    icon: <MdOutlineRateReview size={20} />,
  },
  {
    key: "/subscribers",
    label: (
      <Link to={"/subscribers"} className="font-medium">
        Customer Subscribers
      </Link>
    ),
    icon: <RiMailAiLine size={20} />,
  },
  {
    key: "/contact",
    label: (
      <Link to={"/contact"} className="font-medium">
        Customer Contact
      </Link>
    ),
    icon: <LuMessageCircleReply size={20} />,
  },

  {
    key: "content-group",
    label: "Content & System",
    type: "group",
  },
  {
    key: "/blogs",
    label: (
      <Link to={"/blogs"} className="font-medium">
        Blog Management
      </Link>
    ),
    icon: <ImBlog size={20} />,
  },
  {
    key: "/trash",
    label: (
      <Link to={"/trash"} className="font-medium">
        Deleted Items
      </Link>
    ),
    icon: <IoTrashOutline size={20} />,
  },
];

const SiderComponent: React.FC<SiderComponentProps> = ({
  collapsed,
  onCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathName = location.pathname;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const keyOpen =
    pathName.substring(1).substring(0, pathName.substring(1).indexOf("/")) ||
    pathName.substring(1);

  const handleMenuClick = () => {
    if (isMobile && !collapsed) {
      onCollapse(true);
    }
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black opacity-50"
          onClick={() => onCollapse(true)}
        />
      )}

      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        className={`h-screen shadow-lg transition-all duration-300 ${
          isMobile ? "fixed z-50 lg:relative" : "sticky top-0"
        }`}
        style={{
          position: isMobile ? "fixed" : "sticky",
          borderRight: "1px solid #e5e7eb",
          top: 0,
          bottom: 0,
          left: isMobile && collapsed ? -250 : 0,
          zIndex: isMobile ? 100 : 50,
          transform: isMobile
            ? collapsed
              ? "translateX(-100%)"
              : "translateX(0)"
            : "none",
        }}
        width={250}
        collapsedWidth={isMobile ? 0 : 80}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          if (broken) {
            onCollapse(true);
          }
        }}
      >
        <div className="flex flex-col w-full h-full">
          <div
            className={`p-4 border-b border-gray-100 ${
              collapsed ? "px-2" : ""
            }`}
          >
            <Link
              to={"/"}
              className="group flex items-center space-x-3 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden p-1.5 shadow-md group-hover:shadow-lg transition-shadow">
                <img
                  src={Logo}
                  alt="Logo"
                  className="object-contain w-full h-full bg-white rounded-lg"
                />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="group-hover:text-blue-600 text-lg font-bold text-gray-900 truncate transition-colors">
                    {appName.appConstantname}
                  </p>
                  <p className="text-xs font-medium text-gray-500 truncate">
                    Admin Panel
                  </p>
                </div>
              )}
            </Link>
          </div>

          <div
            className={`flex-1 overflow-y-auto py-2 ${styles.siderMenu}`}
            style={{
              WebkitScrollSnapType: "y mandatory",
              scrollSnapType: "y mandatory",
              scrollbarWidth: "thin",
              msOverflowStyle: "none",
              scrollbarColor: "#ddd #f0f0f0",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            <Menu
              items={items}
              mode="inline"
              defaultSelectedKeys={[pathName]}
              defaultOpenKeys={collapsed ? [] : [keyOpen]}
              selectedKeys={[pathName]}
              onClick={handleMenuClick}
              className="border-none"
              inlineCollapsed={collapsed}
              style={{
                backgroundColor: "transparent",
              }}
              theme="light"
            />
          </div>

          <div
            className={`p-4 border-t border-gray-100 ${
              collapsed ? "px-2" : ""
            }`}
          >
            <div
              className={`
              flex items-center rounded-xl cursor-pointer transition-all duration-200 
              gap-3 py-3 px-4 group relative
              ${collapsed ? "justify-center px-2" : ""}
              ${
                pathName === "/setting"
                  ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                  : "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
              }
            `}
              onClick={() => navigate("/setting")}
              title={collapsed ? "Settings" : ""}
            >
              <IoSettingsOutline
                size={20}
                className={`transition-all duration-200 group-hover:rotate-45 ${
                  pathName === "/setting" ? "text-blue-600" : "text-gray-500"
                }`}
              />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium">Settings</span>
                  {pathName === "/setting" && (
                    <div className="right-2 absolute w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Sider>
    </>
  );
};

export default SiderComponent;
