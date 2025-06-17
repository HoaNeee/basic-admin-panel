/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnType } from "antd/es/table";
import type { Supplier } from "../../models/supplier";
import { Button, Popconfirm, Space } from "antd";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

export const columns = (
  page: any,
  limit: any,
  setSupplierSelect: any,
  setOpenModal: any,
  handleDeleteItem: any
): ColumnType<Supplier>[] => {
  return [
    {
      key: "sn",
      dataIndex: "_id",
      title: "#",
      render: (_val, _record, index) => {
        return (page - 1) * limit + 1 + index;
      },
      width: 80,
    },
    {
      key: "id",
      dataIndex: "name",
      title: "Supplier Name",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "product",
      dataIndex: "product",
      title: "Product",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "contact",
      dataIndex: "contact",
      title: "Contact",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "email",
      dataIndex: "email",
      title: "Email",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "type",
      dataIndex: "isTaking",
      title: "Type",
      render: (num: number) => {
        return num ? (
          <p className="text-green-500">Taking Return</p>
        ) : (
          <p className="text-red-500">Not Taking Return</p>
        );
      },
    },
    {
      key: "ontheway",
      dataIndex: "ontheway",
      title: "On the way",
      render: (val: number) => {
        return val ? <p>0</p> : <p className="">-</p>;
      },
    },
    {
      key: "action",
      dataIndex: "",
      title: "Actions",
      render: (_, record) => {
        return (
          <Space>
            <Button
              icon={<AiFillEdit size={16} />}
              onClick={() => {
                setSupplierSelect(record);
                setOpenModal(true);
              }}
            />
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDeleteItem(record._id)}
            >
              <Button icon={<MdDelete size={16} />} danger />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
    },
  ];
};
