/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import MyTable from "../components/MyTable";
import { Button, Popconfirm, Space } from "antd";
import { AiFillEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import type { ColumnType } from "antd/es/table";
import { Link, useNavigate } from "react-router";

const Inventory = () => {
  const prefix_api = "/products";

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const api = prefix_api;
    try {
      setIsLoading(true);
      const response: any = await handleAPI(api);
      setProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnType<any>[] = [
    // {
    //   key: "sn",
    //   dataIndex: "_id",
    //   title: "#",
    //   render: (_val, _record, index) => {
    //     return (page - 1) * limit + 1 + index;
    //   },
    //   width: 80,
    // },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
      render: (value, record) => {
        return value ? (
          <Link to={`/inventories/edit-product/${record._id}`}>{value}</Link>
        ) : (
          "-"
        );
      },
    },
    {
      key: "thumbnail",
      dataIndex: "thumbnail",
      title: "Thumbnail",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "short",
      dataIndex: "shortDescription",
      title: "Description",
      render: (value) => {
        return value ? value : "-";
      },
    },
    {
      key: "categories",
      dataIndex: "categories",
      title: "Categories",
      render: () => {
        return "-";
      },
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      render: (value: number) => {
        return value ? value.toLocaleString() : "-";
      },
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: "Stock",
    },
    {
      key: "productType",
      dataIndex: "productType",
      title: "Product Type",
    },
    {
      key: "action",
      dataIndex: "",
      title: "Actions",
      render: (_, record) => {
        return (
          <Space>
            <div>
              <Button
                icon={<AiFillEdit size={16} />}
                onClick={() => {
                  navigate(`/inventories/edit-product/${record._id}`);
                }}
              />
            </div>
            <Popconfirm title="Are you sure?" onConfirm={() => {}}>
              <Button icon={<MdDelete size={16} />} danger />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
      align: "right",
    },
  ];

  return (
    <>
      <MyTable
        columns={columns}
        data={products}
        onChange={() => {}}
        onShowSizeChange={() => {}}
        rowKey="_id"
        loading={isLoading}
        total={0}
      />
    </>
  );
};

export default Inventory;
