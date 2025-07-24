/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, message, Select, Table, type MenuProps } from "antd";
import TableFilter from "../components/TableFilter";
import { handleAPI } from "../apis/request";
import { useEffect, useState, useCallback } from "react";
import type { CustomerModel } from "../models/customerModel";
import type { ColumnType } from "antd/es/table";
import { FiUsers, FiMail, FiCalendar, FiShield } from "react-icons/fi";

const statusItems: MenuProps["items"] = [
  {
    key: "active",
    label: "Active",
  },
  {
    key: "banned",
    label: "Banned",
  },
];

interface FilterCustomer {
  status: string;
}

const initialFilter: FilterCustomer = {
  status: "",
};

const Customers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, settotalRecord] = useState();
  const [valueFilter, setValueFilter] = useState<FilterCustomer>(initialFilter);
  const [filter, setFilter] = useState<FilterCustomer>(initialFilter);
  const [keyword, setKeyword] = useState("");

  const [messApi, context] = message.useMessage();

  const getCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = `/customers?page=${page}&limit=${limit}&status=${filter.status}&keyword=${keyword}`;
      const response = await handleAPI(api);
      setCustomers(response.data.customers);
      settotalRecord(response.data.totalRecord);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filter.status, keyword]);

  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  const handleUpdateStatus = async (cus_id: string, status: string) => {
    try {
      setIsLoading(true);
      const response: any = await handleAPI(
        "/customers/change-status/" + cus_id,
        {
          status: status,
        },
        "patch"
      );

      const items = [...customers];

      const index = items.findIndex((it) => it._id === cus_id);
      if (index !== -1) {
        items[index].status = status;
        setCustomers(items);
      }

      messApi.success(response.message);
    } catch (error: any) {
      messApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnType<CustomerModel>[] = [
    {
      key: "fullName",
      title: (
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">Full Name</span>
        </div>
      ),
      dataIndex: "firstName",
      render: (_, record) => {
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-blue-600">
                {(record?.firstName?.[0] || "") + (record?.lastName?.[0] || "")}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {record?.firstName || ""} {record?.lastName || ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      title: (
        <div className="flex items-center gap-2">
          <FiMail className="w-4 h-4 text-green-600" />
          <span className="font-semibold">Email Address</span>
        </div>
      ),
      dataIndex: "email",
      render: (value) => (
        <div className="flex items-center">
          <span className="text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      key: "join",
      title: (
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">Join Date</span>
        </div>
      ),
      dataIndex: "createdAt",
      render: (value) => {
        return (
          <div className="flex items-center">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {new Date(value).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="text-gray-500">
                {new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      title: (
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4 text-orange-600" />
          <span className="font-semibold">Status</span>
        </div>
      ),
      dataIndex: "status",
      align: "center",
      render: (value, record) => {
        let color = "";
        let bgColor = "";
        let borderColor = "";

        switch (value) {
          case "active":
            color = "text-green-700";
            bgColor = "bg-green-50";
            borderColor = "border-green-200";
            break;
          case "banned":
            color = "text-red-700";
            bgColor = "bg-red-50";
            borderColor = "border-red-200";
            break;
          default:
            color = "text-gray-700";
            bgColor = "bg-gray-50";
            borderColor = "border-gray-200";
            break;
        }

        return (
          <Dropdown
            menu={{
              items: statusItems,
              selectable: true,
              selectedKeys: [value],
              onSelect: async (e) => {
                await handleUpdateStatus(record._id, e.key);
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:shadow-sm transition-all ${color} ${bgColor} ${borderColor}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  value === "active" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="capitalize">{value}</span>
            </div>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      {context}
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage customer accounts and status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="text-lg font-semibold text-gray-900">
                  {totalRecord || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6">
          <TableFilter
            onSearch={(key) => {
              if (page !== 1) {
                setPage(1);
              }
              setKeyword(key);
            }}
            title=""
            filter={
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Filter by Status
                  </label>
                  <Select
                    allowClear
                    className="w-full"
                    placeholder="Choose status"
                    options={statusItems.map((item) => {
                      return {
                        label: (
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item?.key === "active"
                                  ? "bg-green-500"
                                  : "bg-red-500"
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
                    onClear={() => {
                      setValueFilter({
                        ...valueFilter,
                        status: "",
                      });
                    }}
                    value={valueFilter.status || null}
                    onChange={(e) => {
                      if (e) {
                        setValueFilter({
                          ...valueFilter,
                          status: e,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            }
            onFilter={() => {
              if (page !== 1) {
                setPage(1);
              }
              setFilter(valueFilter);
            }}
            onClearFilter={() => {
              if (page !== 1) {
                setPage(1);
              } else if (valueFilter) {
                setFilter(initialFilter);
                setValueFilter(initialFilter);
              }
            }}
          >
            <Table
              dataSource={customers}
              columns={columns}
              loading={isLoading}
              rowKey={"_id"}
              pagination={{
                pageSize: limit,
                total: totalRecord,
                onChange(page, pageSize) {
                  setPage(page);
                  setLimit(pageSize);
                },
                current: page,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} customers`,
              }}
              className="border-none"
              scroll={{
                x: "100%",
              }}
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No customers found
                    </h3>
                    <p className="text-gray-500">
                      No customers match your current filters
                    </p>
                  </div>
                ),
              }}
            />
          </TableFilter>
        </div>
      </div>
    </>
  );
};

export default Customers;
