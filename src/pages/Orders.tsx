/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Divider,
  Dropdown,
  Flex,
  Input,
  message,
  Space,
  type MenuProps,
} from "antd";
import MyTable from "../components/MyTable";
import { IoFilterOutline } from "react-icons/io5";
import { handleAPI } from "../apis/request";
import { useEffect, useState } from "react";
import type { POProduct, PurchaseOrderModel } from "../models/puchaseOrder";
import type { ColumnProps } from "antd/es/table";
import { VND } from "../helpers/formatCurrency";
import { Link } from "react-router";
import StatisticPurchaseOrder from "./purchase-order/StatisticPurchaseOrder";

const statusItems: MenuProps["items"] = [
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },

  {
    key: "delivering",
    label: "Delivering",
  },
  {
    key: "canceled",
    label: "Canceled",
  },
  {
    key: "received",
    label: "Received",
  },
];

const Orders = () => {
  const [purchases, setPurchases] = useState<PurchaseOrderModel[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);

  const [mesApi, contextMes] = message.useMessage();

  useEffect(() => {
    getPurchaseOrder();
  }, [page, limit]);

  const getPurchaseOrder = async () => {
    try {
      setIsLoading(true);
      const api = `/purchase-orders?page=${page}&limit=${limit}`;
      const response = await handleAPI(api);
      setPurchases(response.data.purchase_orders);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      setIsUpdating(true);
      const api = `/purchase-orders/change-status/${id}`;
      const response: any = await handleAPI(
        api,
        {
          status: status,
        },
        "patch"
      );

      mesApi.success(response.message);

      const items = [...purchases];
      const index = items.findIndex((item) => item._id === id);
      if (index !== -1) {
        items[index].status = status;
        setPurchases(items);
      }
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: ColumnProps<PurchaseOrderModel>[] = [
    {
      key: "products",
      title: "Products",
      dataIndex: "templateProduct",
      render(val, record) {
        return (
          <div className="">
            <p className="">
              <span
                className="hover:text-blue-500 transition-all duration-300 cursor-pointer inline-block"
                onClick={() => {
                  console.log(record);
                }}
              >
                {val.title}{" "}
              </span>
              {record.products.length > 1 ? (
                <span className="text-gray-500 text-sm">
                  {" "}
                  (+{record.products.length - 1} other products)
                </span>
              ) : (
                ""
              )}
            </p>
          </div>
        );
      },
    },
    {
      key: "totalCost",
      title: "Order Value",
      dataIndex: "totalCost",
      render(val: number) {
        return <p>{VND.format(val)}</p>;
      },
    },
    {
      key: "quantity",
      title: "Quantity",
      dataIndex: "products",
      render: (val: POProduct[]) => {
        return (
          <p>{val.reduce((val: number, item) => val + item.quantity, 0)}</p>
        );
      },
    },
    {
      key: "expectedDelivery",
      title: "Expected Delivery",
      dataIndex: "expectedDelivery",
      render: (val: string) => {
        return (
          <p>
            {new Date(
              val ? val : new Date().getTime() + 1000 * 60 * 60 * 24 * 5
            ).toLocaleDateString()}
          </p>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (val: string, record: PurchaseOrderModel) => {
        let color = "yellow";

        switch (val) {
          case "pending":
            color = "text-yellow-500";
            break;
          case "confirmed":
            color = "text-blue-500";
            break;
          case "received":
            color = "text-green-500";
            break;
          case "delivering":
            color = "text-red-500";
            break;
          case "canceled":
            color = "text-gray-500";
            break;
          default:
            break;
        }

        return (
          <Dropdown
            menu={{
              items: statusItems,
              selectable: true,
              selectedKeys: [val],
              onSelect: async (e) => {
                await handleChangeStatus(record._id, e.key);
              },
            }}
            trigger={["click"]}
          >
            <p className={`${color} cursor-pointer capitalize`}>{val}</p>
          </Dropdown>
        );
      },
    },

    // {
    //   key: "actions",
    //   title: <div className="text-center">Actions</div>,
    //   dataIndex: "",
    //   render: (_, record) => {
    //     return (
    //       <Space size={"small"}>
    //         <Button
    //           icon={<IoMdEye size={15} />}
    //           onClick={() => {
    //             console.log(record);
    //           }}
    //         />
    //       </Space>
    //     );
    //   },
    //   fixed: "right",
    //   align: "center",
    // },
  ];

  return (
    <div className="flex flex-col gap-4">
      {contextMes}
      <StatisticPurchaseOrder />
      <div className="w-full h-full bg-white p-4 rounded-md">
        <Flex justify="space-between" className="">
          <h2 className="font-medium text-xl">Purchase Order</h2>
          <Space size={10}>
            <Input.Search
              placeholder="Enter keyword..."
              onSearch={async (key) => {
                console.log(key);
              }}
              allowClear
            />
            <Button icon={<IoFilterOutline size={16} />}>Filters</Button>
            <Divider type="vertical" />
            <Button type="primary">
              <Link to={"/orders/add-purchase-order"}> New Order</Link>
            </Button>
            <Button>Order history</Button>
          </Space>
        </Flex>
        <MyTable
          columns={columns}
          data={purchases}
          rowKey="_id"
          onChange={() => {}}
          onShowSizeChange={() => {}}
          loading={isUpdating || isLoading}
          pagination={{
            total: totalRecord,
            onChange(page, pageSize) {
              setPage(page);
              setLimit(pageSize);
            },
          }}
        />
      </div>
    </div>
  );
};

export default Orders;
