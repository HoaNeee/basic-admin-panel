/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, message, Select, Table, Tag, type MenuProps } from "antd";
import TableFilter from "../components/TableFilter";
import { handleAPI } from "../apis/request";
import { useEffect, useState } from "react";
import type { CustomerModel } from "../models/customerModel";
import type { ColumnType } from "antd/es/table";

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

  useEffect(() => {
    getCustomers();
  }, [page, filter, keyword]);

  const getCustomers = async () => {
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
  };

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
      title: "Full Name",
      dataIndex: "firstName",
      render: (_, record) => {
        return (
          <p>
            {record?.firstName || ""} {record?.lastName || ""}
          </p>
        );
      },
    },
    {
      key: "email",
      title: "Email",
      dataIndex: "email",
    },
    {
      key: "join",
      title: "Join At",
      dataIndex: "createdAt",
      render: (value) => {
        return (
          <p>
            {new Date(value).toLocaleDateString("vi", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        );
      },
    },

    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (value, record) => {
        let color = "";
        switch (value) {
          case "active":
            color = "green";
            break;
          case "banned":
            color = "red";
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
                await handleUpdateStatus(record._id, e.key);
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

  return (
    <>
      {context}
      <div className="w-full h-full">
        <TableFilter
          onSearch={(key) => {
            if (page !== 1) {
              setPage(1);
            }
            setKeyword(key);
          }}
          title="Customers"
          filter={
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <p>Status: </p>
                <Select
                  allowClear
                  className="w-full"
                  placeholder="Choose status"
                  options={statusItems.map((item) => {
                    return {
                      label: (
                        <p className="capitalize">{item?.key as string}</p>
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
            }}
          />
        </TableFilter>
      </div>
    </>
  );
};

export default Customers;
