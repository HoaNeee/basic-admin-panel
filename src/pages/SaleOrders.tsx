/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  DatePicker,
  Divider,
  Dropdown,
  Flex,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  type MenuProps,
} from "antd";
import { IoFilterOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import type { ProductSaleOrder, SaleOrder } from "../models/saleOrder";
import type { ColumnType } from "antd/es/table";
import { VND } from "../helpers/formatCurrency";
import TextArea from "antd/es/input/TextArea";
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
  const [openModalReson, setOpenModalReson] = useState(false);
  const [orderSelected, setOrderSelected] = useState<SaleOrder>();
  const [keyword, setKeyword] = useState("");
  const [valueFilter, setValueFilter] = useState<FilterOrder>(initialFilter);
  const [filter, setFilter] = useState<FilterOrder>(initialFilter);

  const [messApi, context] = message.useMessage();

  useEffect(() => {
    getSaleOrders();
  }, [page, keyword, filter]);

  const getSaleOrders = async () => {
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
  };

  const columns: ColumnType<SaleOrder>[] = [
    {
      key: "orderno",
      title: "Order No",
      dataIndex: "orderNo",
    },
    {
      key: "customer",
      title: "Customer",
      dataIndex: "customer",
      render: (value) => {
        return (
          <p>
            {value?.firstName || ""} {value?.lastName || ""}
          </p>
        );
      },
    },
    {
      key: "createdAt",
      title: "Ordere Date",
      dataIndex: "createdAt",
      render: (value) => {
        return (
          <p>
            {new Date(value).toLocaleDateString("vi", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </p>
        );
      },
    },
    {
      key: "quantity",
      title: "Quantity",
      dataIndex: "products",
      render: (value: ProductSaleOrder[]) => {
        return (
          <p>{value.reduce((val, item) => val + item.quantity, 0)} packets</p>
        );
      },
      align: "center",
    },
    {
      key: "payment",
      title: "Payment Method",
      dataIndex: "paymentMethod",
      render: (value) => {
        return <p className="uppercase">{value}</p>;
      },
      align: "center",
    },
    {
      key: "total",
      title: "Total Price",
      dataIndex: "totalPrice",
      render: (value) => {
        return <p>{VND.format(value)}</p>;
      },

      sorter: (a, b) => {
        return a.totalPrice - b.totalPrice;
      },
      align: "center",
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (value, record) => {
        let color = "";
        switch (value) {
          case "pending":
            color = "gold";
            break;
          case "delivered":
            color = "green";
            break;
          case "canceled":
            color = "gray";
            break;
          case "shipping":
            color = "red";
            break;
          case "confirmed":
            color = "blue";
            break;

          default:
            break;
        }
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
            <Tag color={color} className="cursor-pointer capitalize">
              {value}
            </Tag>
          </Dropdown>
        );
      },
    },
  ];

  const handleChangeStatus = async (
    order_id: string,
    payload: {
      status: string;
      resonCancel?: string;
      canceledBy?: string;
    }
  ) => {
    if (payload.status === "canceled") {
      setOpenModalReson(true);
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
      <div className="bg-white w-full h-full p-5 rounded-sm">
        <Flex justify="space-between" align="center">
          <div className="flex gap-4 items-center">
            <p className="text-lg font-medium">Sale Orders</p>
          </div>
          <Space size={5}>
            <Input.Search
              placeholder="Enter username..."
              onSearch={(key) => {
                if (page !== 1) {
                  setPage(1);
                }
                setKeyword(key);
              }}
              allowClear
            />
            <Dropdown
              trigger={["click"]}
              arrow
              placement="bottom"
              popupRender={() => {
                return (
                  <div className="w-xs bg-white shadow-xl rounded-sm p-4">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-1">
                        <p>Range Date: </p>
                        <DatePicker.RangePicker
                          value={
                            valueFilter &&
                            valueFilter.fromDate &&
                            valueFilter.toDate
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
                        />
                      </div>
                      <div className="space-y-1">
                        <p>Status: </p>
                        <Select
                          allowClear
                          className="w-full"
                          placeholder="Choose status"
                          options={statusItems.map((item) => {
                            return {
                              label: (
                                <p className="capitalize">
                                  {item?.key as string}
                                </p>
                              ),
                              value: item?.key,
                            };
                          })}
                          value={valueFilter?.status}
                          onChange={(e) => {
                            setValueFilter({
                              ...valueFilter,
                              status: e,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-2 mt-5">
                      <Button
                        onClick={() => {
                          setValueFilter(initialFilter);
                          setFilter(initialFilter);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          if (valueFilter) {
                            if (page !== 1) {
                              setPage(1);
                              setFilter({ ...valueFilter });
                            }
                          }
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                );
              }}
            >
              <Button icon={<IoFilterOutline size={16} />}>Filters</Button>
            </Dropdown>
            <Divider type="vertical" />
            <Button onClick={() => {}}>Download all</Button>
          </Space>
        </Flex>
        <div className="mt-4">
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
            }}
          />
        </div>
      </div>
      <ModalReson
        isOpen={openModalReson}
        onClose={() => {
          setOrderSelected(undefined);
          setOpenModalReson(false);
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
              setOpenModalReson(false);
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

const ModalReson = ({
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
  const [reson, setReson] = useState("");

  const handleClose = () => {
    onClose();
    setReson("");
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      okText="Submit"
      onOk={() => onOk(reson)}
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
        value={reson}
        onChange={(e) => setReson(e.target.value)}
      />
    </Modal>
  );
};

export default SaleOrders;
