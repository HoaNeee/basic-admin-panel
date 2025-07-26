/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Dropdown,
  message,
  Modal,
  Select,
  Table,
  type MenuProps,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import { handleAPI } from "../apis/request";
import type { ProductSaleOrder, SaleOrder } from "../models/saleOrder";
import type { ColumnType } from "antd/es/table";
import { VND } from "../helpers/formatCurrency";
import TextArea from "antd/es/input/TextArea";

import dayjs from "dayjs";
import TableFilter from "../components/TableFilter";
import { Link } from "react-router";
import {
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiDownload,
  FiPackage,
  FiCreditCard,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";

const statusItems: MenuProps["items"] = [
  {
    key: "pending",
    label: "Pending",
    disabled: true,
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },

  {
    key: "shipping",
    label: "Shipping",
  },
  {
    key: "canceled",
    label: "Canceled",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

interface FilterOrder {
  status: string;
  fromDate: string;
  toDate: string;
}

const initialFilter: FilterOrder = {
  status: "",
  fromDate: "",
  toDate: "",
};

const SaleOrders = () => {
  const [saleOrders, setSaleOrders] = useState<SaleOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [openModalReason, setOpenModalReason] = useState(false);
  const [orderSelected, setOrderSelected] = useState<SaleOrder>();
  const [valueFilter, setValueFilter] = useState<FilterOrder>(initialFilter);
  const [filter, setFilter] = useState<FilterOrder>(initialFilter);

  const [messApi, context] = message.useMessage();

  const getSaleOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = `/orders?page=${page}&limit=${limit}&keyword=${keyword}&from=${filter.fromDate}&to=${filter.toDate}&status=${filter.status}&sort=createdAt-desc`;
      const response = await handleAPI(api);
      setSaleOrders(response.data.orders);
      setTotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, keyword, filter.fromDate, filter.toDate, filter.status]);

  useEffect(() => {
    getSaleOrders();
  }, [getSaleOrders]);

  const columns: ColumnType<SaleOrder>[] = [
    {
      key: "orderno",
      title: (
        <div className="flex items-center gap-2">
          <FiShoppingCart className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Order No</span>
        </div>
      ),
      dataIndex: "orderNo",
      render(value, record) {
        return (
          <Link
            to={`/sale-orders/${record._id}`}
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            #{value}
          </Link>
        );
      },
    },
    {
      key: "customer",
      title: (
        <div className="flex items-center gap-2">
          <FiUser className="w-4 h-4 text-green-600" />
          <span className="font-semibold">Customer</span>
        </div>
      ),
      dataIndex: "customer",
      render: (value) => {
        const fullName = `${value?.firstName || ""} ${
          value?.lastName || ""
        }`.trim();

        return (
          <div className="flex items-center">
            <div>
              <p className="font-medium text-gray-900">
                {fullName || "Anonymous"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "address",
      title: (
        <div className="flex items-center gap-2">
          <FiMapPin className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">Shipping Address</span>
        </div>
      ),
      dataIndex: "shippingAddress",
      render: (value) => {
        return (
          <div className="max-w-xs">
            <p className="font-medium text-gray-900 text-sm">
              {value?.name} - {value?.phone}
            </p>
            <p
              className="text-gray-600 text-sm truncate"
              title={value?.address}
            >
              {value?.address}
            </p>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      title: (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-orange-600" />
          <span className="font-semibold">Order Date</span>
        </div>
      ),
      dataIndex: "createdAt",
      render: (value) => {
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {new Date(value).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-gray-500">
              {new Date(value).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "quantity",
      title: (
        <div className="flex items-center gap-2">
          <FiPackage className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold">Quantity</span>
        </div>
      ),
      dataIndex: "products",
      render: (value: ProductSaleOrder[]) => {
        const totalQuantity = value.reduce(
          (val, item) => val + item.quantity,
          0
        );
        return (
          <div className="text-center">
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
              <span className="font-medium">{totalQuantity}</span>
              <span className="ml-1 text-sm">items</span>
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "payment",
      title: (
        <div className="flex items-center gap-2">
          <FiCreditCard className="w-4 h-4 text-cyan-600" />
          <span className="font-semibold">Payment</span>
        </div>
      ),
      dataIndex: "paymentMethod",
      render: (value) => {
        const paymentColors = {
          cash: "bg-green-100 text-green-700",
          card: "bg-blue-100 text-blue-700",
          bank: "bg-purple-100 text-purple-700",
          online: "bg-orange-100 text-orange-700",
        };

        const colorClass =
          paymentColors[value as keyof typeof paymentColors] ||
          "bg-gray-100 text-gray-700";

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase ${colorClass}`}
            >
              {value}
            </span>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "total",
      title: (
        <div className="flex items-center gap-2">
          <FiDollarSign className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Total Price</span>
        </div>
      ),
      dataIndex: "totalPrice",
      render: (value) => {
        return (
          <div className="text-center">
            <p className="font-semibold text-emerald-600">
              {VND.format(value)}
            </p>
          </div>
        );
      },
      sorter: (a, b) => {
        return a.totalPrice - b.totalPrice;
      },
      align: "center",
    },
    {
      key: "status",
      title: (
        <div className="flex items-center gap-2">
          <FiCheckCircle className="w-4 h-4 text-amber-600" />
          <span className="font-semibold">Status</span>
        </div>
      ),
      dataIndex: "status",
      align: "center",
      render: (value, record) => {
        const statusConfig = {
          pending: {
            color: "bg-yellow-100 text-yellow-700 border-yellow-200",
            dot: "bg-yellow-500",
          },
          delivered: {
            color: "bg-green-100 text-green-700 border-green-200",
            dot: "bg-green-500",
          },
          canceled: {
            color: "bg-gray-100 text-gray-700 border-gray-200",
            dot: "bg-gray-500",
          },
          shipping: {
            color: "bg-blue-100 text-blue-700 border-blue-200",
            dot: "bg-blue-500",
          },
          confirmed: {
            color: "bg-purple-100 text-purple-700 border-purple-200",
            dot: "bg-purple-500",
          },
        };

        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.pending;

        return (
          <Dropdown
            menu={{
              items: statusItems,
              selectable: true,
              selectedKeys: [value],
              onSelect: async (e) => {
                setOrderSelected(record);
                handleChangeStatus(record._id, { status: e.key });
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:shadow-sm transition-all ${config.color}`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`}></div>
              <span className="capitalize">{value}</span>
            </div>
          </Dropdown>
        );
      },
    },
  ];

  const handleChangeStatus = async (
    order_id: string,
    payload: {
      status: string;
      reasonCancel?: string;
      canceledBy?: string;
    }
  ) => {
    if (payload.status === "canceled") {
      setOpenModalReason(true);
      return;
    }
    try {
      setIsLoading(true);
      await handleChangeStatusCall(order_id, payload);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatusCall = async (
    order_id: string,
    payload: {
      status: string;
      resonCancel?: string;
      canceledBy?: string;
    }
  ) => {
    const api = `/orders/change-status/${order_id}`;
    const response: any = await handleAPI(api, payload, "patch");
    const items = [...saleOrders];
    const index = items.findIndex((item) => item._id === order_id);
    if (index !== -1) {
      items[index].status = payload.status;
      setSaleOrders(items);
    }
    messApi.success(response.message);
  };

  return (
    <>
      {context}
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Sales Orders
                </h1>
                <p className="text-sm text-gray-500">
                  Manage customer orders and fulfillment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-lg font-semibold text-gray-900">
                  {totalRecord || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-lg font-semibold text-emerald-600">
                  {VND.format(
                    saleOrders.reduce((sum, order) => sum + order.totalPrice, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6">
          {" "}
          <TableFilter
            extra={
              <Button
                icon={<FiDownload className="w-4 h-4" />}
                onClick={() => {}}
                className="flex items-center gap-2"
              >
                Export Orders
              </Button>
            }
            title=""
            onFilter={() => {
              if (valueFilter) {
                if (page !== 1) {
                  setPage(1);
                }
                setFilter({ ...valueFilter });
              }
            }}
            onClearFilter={() => {
              setValueFilter(initialFilter);
              setFilter(initialFilter);
            }}
            onSearch={(key) => {
              if (page !== 1) {
                setPage(1);
              }
              setKeyword(key);
            }}
            placeholderInputSearch="Search orders, customers..."
            filter={
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <DatePicker.RangePicker
                    value={
                      valueFilter && valueFilter.fromDate && valueFilter.toDate
                        ? [
                            dayjs(valueFilter.fromDate),
                            dayjs(valueFilter.toDate),
                          ]
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
                        delivered: { dot: "bg-green-500" },
                        canceled: { dot: "bg-gray-500" },
                        shipping: { dot: "bg-blue-500" },
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
          >
            <Table
              dataSource={saleOrders}
              columns={columns}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                total: totalRecord,
                onChange(page, pageSize) {
                  setPage(page);
                  setLimit(pageSize);
                },
                pageSize: limit,
                current: page,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} orders`,
              }}
              className="border-none"
              scroll={{
                x: 800,
                y: "calc(100vh - 300px)",
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No orders found
                    </h3>
                    <p className="text-gray-500">
                      No orders match your current filters
                    </p>
                  </div>
                ),
              }}
            />
          </TableFilter>
        </div>
      </div>
      <ModalReason
        isOpen={openModalReason}
        onClose={() => {
          setOrderSelected(undefined);
          setOpenModalReason(false);
        }}
        onOk={async (reson) => {
          if (orderSelected) {
            try {
              setIsLoading(true);
              await handleChangeStatusCall(orderSelected?._id, {
                status: "canceled",
                resonCancel: reson,
                canceledBy: "admin",
              });
              setOpenModalReason(false);
            } catch (error) {
              console.log(error);
            } finally {
              setIsLoading(false);
            }
          }
        }}
        loading={isLoading}
      />
    </>
  );
};

export const ModalReason = ({
  isOpen,
  onClose,
  onOk,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOk: (val: string) => void;
  loading?: boolean;
}) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    onClose();
    setReason("");
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      okText="Submit"
      onOk={() => onOk(reason)}
      title="Waiting..."
      closable={false}
      maskClosable={false}
      okButtonProps={{
        loading: loading,
      }}
    >
      <p className="my-4 text-gray-500">
        Let the customer know why this order is being canceled.
      </p>
      <TextArea
        placeholder="Write something..."
        rows={6}
        className=""
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
};

export default SaleOrders;
