/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Dropdown,
  message,
  Select,
  type MenuProps,
} from "antd";
import MyTable from "../components/MyTable";
import { handleAPI } from "../apis/request";
import { useCallback, useEffect, useState } from "react";
import type {
  FilterOrder,
  POProduct,
  PurchaseOrderModel,
} from "../models/puchaseOrder";
import type { ColumnProps } from "antd/es/table";
import { VND } from "../helpers/formatCurrency";
import { Link } from "react-router";
import StatisticPurchaseOrder from "./purchase-order/StatisticPurchaseOrder";
import TableFilter from "../components/TableFilter";
import dayjs from "dayjs";

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

const initialFilter: FilterOrder = {
  status: "",
  fromDate: "",
  toDate: "",
};

const Orders = () => {
  const [purchases, setPurchases] = useState<PurchaseOrderModel[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);
  const [valueFilter, setValueFilter] = useState<FilterOrder>(initialFilter);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterOrder>(initialFilter);

  const [mesApi, contextMes] = message.useMessage();

  const getPurchaseOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = `/purchase-orders?page=${page}&limit=${limit}&keyword=${keyword}&fromDate=${filter.fromDate}&toDate=${filter.toDate}&status=${filter.status}`;
      const response = await handleAPI(api);
      setPurchases(response.data.purchase_orders);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, filter.fromDate, filter.toDate, filter.status]);

  useEffect(() => {
    getPurchaseOrder();
  }, [page, limit, getPurchaseOrder]);

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
        if (!val || !record) return <p>Unknown Product</p>;
        return (
          <div className="">
            <p className="">
              <span
                className="hover:text-blue-500 transition-all duration-300 cursor-pointer inline-block"
                onClick={() => {
                  console.log(record);
                }}
              >
                {val?.title || "Unknown Product"}{" "}
              </span>
              {record?.products?.length > 1 ? (
                <span className="text-gray-500 text-sm">
                  {" "}
                  (+{record?.products?.length - 1} other products)
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
      key: "Supplier",
      title: "Supplier",
      dataIndex: "supplierName",
      render(val: string) {
        return <p>{val || "Unknown Supplier"}</p>;
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
          <p>
            {val.reduce((val: number, item) => val + item.quantity, 0)} Packets
          </p>
        );
      },
    },
    {
      key: "orderDate",
      title: "Order Date",
      dataIndex: "createdAt",
      render(val: string) {
        return <p>{new Date(val).toLocaleDateString()}</p>;
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

      <TableFilter
        title="Purchase Orders"
        onSearch={(val) => {
          setKeyword(val);
          setPage(1);
        }}
        filter={
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <DatePicker.RangePicker
                value={
                  valueFilter && valueFilter.fromDate && valueFilter.toDate
                    ? [dayjs(valueFilter.fromDate), dayjs(valueFilter.toDate)]
                    : null
                }
                onChange={(val) => {
                  if (val) {
                    setValueFilter({
                      ...valueFilter,
                      fromDate: val[0]?.toISOString() || "",
                      toDate: val[1]?.toISOString() || "",
                    });
                  }
                }}
                className="w-full"
                placeholder={["Start date", "End date"]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Order Status
              </label>
              <Select
                allowClear
                className="w-full"
                placeholder="Filter by status"
                options={statusItems.map((item) => {
                  const statusConfig = {
                    pending: { dot: "bg-yellow-500" },
                    received: { dot: "bg-green-500" },
                    canceled: { dot: "bg-gray-500" },
                    delivering: { dot: "bg-blue-500" },
                    confirmed: { dot: "bg-purple-500" },
                  };

                  const config =
                    statusConfig[item?.key as keyof typeof statusConfig];

                  return {
                    label: (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            config?.dot || "bg-gray-500"
                          }`}
                        ></div>
                        <span className="capitalize">
                          {item?.key as string}
                        </span>
                      </div>
                    ),
                    value: item?.key,
                  };
                })}
                value={valueFilter?.status ? valueFilter.status : null}
                onChange={(e) => {
                  setValueFilter({
                    ...valueFilter,
                    status: e,
                  });
                }}
              />
            </div>
          </div>
        }
        onFilter={() => {
          setFilter(valueFilter);
          setPage(1);
        }}
        onClearFilter={() => {
          setValueFilter(initialFilter);
          setFilter(initialFilter);
          setPage(1);
        }}
        extra={
          <>
            <Button type="primary">
              <Link to={"/purchase-orders/add-purchase-order"}> New Order</Link>
            </Button>
            <Button>Order history</Button>
          </>
        }
      >
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
      </TableFilter>
    </div>
  );
};

export default Orders;
