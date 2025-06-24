/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import MyTable from "../components/MyTable";
import {
  Button,
  Divider,
  Dropdown,
  Flex,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import { AiFillEdit } from "react-icons/ai";
import type { ColumnType } from "antd/es/table";
import { Link, useNavigate } from "react-router";
import type { ProductModel } from "../models/productModel";
import { IoFilterOutline } from "react-icons/io5";
import type { CategoryModel } from "../models/categoryModel";
import { RiSubtractFill } from "react-icons/ri";
import { RiDeleteBin5Line } from "react-icons/ri";
import FilterProduct from "../components/FilterProduct";

const Inventory = () => {
  const prefix_api = "/products";

  const [products, setProducts] = useState<ProductModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isFilter, setIsFilter] = useState(false);
  const [valueFilter, setValueFilter] = useState<any>();

  const [mesApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (!isFilter) {
      getProducts();
    }
  }, [page, limit, keyword]);

  useEffect(() => {
    if (isFilter) {
      handleFilter(valueFilter);
    }
  }, [keyword]);

  const getProducts = async () => {
    const api = prefix_api + `?page=${page}&limit=${limit}&keyword=${keyword}`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setProducts(response.data.products);
      setTotalRecord(response.data.totalRecord);
    } catch (error: any) {
      console.log(error);
      mesApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async () => {
    const api = `/categories`;
    try {
      const response = await handleAPI(api);
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = async (values: any) => {
    try {
      setIsLoading(true);
      const api = `/products/filter-product?keyword=${keyword}`;
      const response = await handleAPI(api, values, "post");
      setProducts(response.data.products);
      setTotalRecord(0);
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnType<ProductModel>[] = [
    // {
    //   key: "sn",
    //   dataIndex: "_id",
    //   title: "#",
    //   render: (_val, _record, index) => {
    //     return (page - 1) * limit + 1 + index;
    //   },
    //   width: 70,
    // },
    {
      key: "title",
      dataIndex: "title",
      title: "Title",
      render: (value, record, index) => {
        return value ? (
          <Link to={`/inventories/edit-product/${record._id}`}>{value}</Link>
        ) : (
          <RiSubtractFill key={index} />
        );
      },
    },
    {
      key: "thumbnail",
      dataIndex: "thumbnail",
      title: "Thumbnail",
      render: (value, _record, index) => {
        return value ? (
          <>
            <div
              className=""
              style={{
                width: 100,
                height: 100,
                overflow: "hidden",
              }}
            >
              <img
                src={value}
                style={{ width: "100%", height: "100%" }}
                alt=""
              />
            </div>
          </>
        ) : (
          <RiSubtractFill key={index} />
        );
      },
    },
    {
      key: "short",
      dataIndex: "shortDescription",
      title: "Description",
      render: (value, _record, index) => {
        return value ? value : <RiSubtractFill key={index} />;
      },
    },
    {
      key: "categories",
      dataIndex: "categories",
      title: "Categories",
      render: (values, _record, index) => {
        if (!values || values.length <= 0) {
          return <RiSubtractFill />;
        }
        return values.map((id: string) => {
          if (!id) return <RiSubtractFill key={index} />;
          const item = categories.find((item) => item._id === id);
          return (
            <Tag color="blue" key={id}>
              {item?.title}
            </Tag>
          );
        });
      },
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      render: (value: number, record, index) => {
        return value !== null &&
          value !== undefined &&
          record.productType !== "variations" ? (
          value.toLocaleString()
        ) : record?.rangePrice ? (
          `${record?.rangePrice.min} - ${record?.rangePrice.max}`
        ) : (
          <RiSubtractFill key={index} />
        );
      },
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: "Stock",
      render: (value: number, record, index) => {
        return value !== null &&
          value !== undefined &&
          value &&
          record.productType !== "variations" ? (
          value
        ) : record?.rangeStock ? (
          record?.rangeStock
        ) : (
          <RiSubtractFill key={index} />
        );
      },
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
                type="link"
                icon={<AiFillEdit size={20} />}
                onClick={() => {
                  navigate(`/inventories/edit-product/${record._id}`);
                }}
              />
            </div>
            <Popconfirm title="Are you sure?" onConfirm={() => {}}>
              <Button
                type="link"
                icon={<RiDeleteBin5Line size={20} />}
                danger
              />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="bg-white w-full h-full px-3 py-2 rounded-sm">
        <Flex justify="space-between" align="center">
          <div className="flex gap-4 items-center">
            <p className="text-lg font-medium">Products</p>
            {selectedRowKeys.length > 0 && (
              <>
                <p>{selectedRowKeys.length} selected</p>
                <Button>Option</Button>
              </>
            )}
          </div>
          <Space size={5}>
            <Input.Search
              placeholder="Enter keyword..."
              onSearch={async (key) => {
                if (!key && keyword) {
                  if (isFilter) {
                    await handleFilter(valueFilter);
                  } else {
                    await getProducts();
                  }
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
                  <FilterProduct
                    mesApi={mesApi}
                    values={{
                      categories: categories,
                    }}
                    onFilter={(values: any) => {
                      setIsFilter(true);
                      setValueFilter(values);
                      handleFilter(values);
                    }}
                    onClear={async () => {
                      setIsFilter(false);
                      if (isFilter) {
                        await getProducts();
                      }
                    }}
                  />
                );
              }}
            >
              <Button icon={<IoFilterOutline size={16} />}>Filters</Button>
            </Dropdown>
            <Divider type="vertical" />
            <Link to={"/inventories/add-new-product"}>
              <Button type="primary" onClick={() => {}}>
                Add Product
              </Button>
            </Link>
            <Button onClick={() => {}}>Download all</Button>
          </Space>
        </Flex>
        <div className="mt-4">
          <MyTable
            columns={columns}
            data={products}
            onChange={(page) => {
              setPage(page);
            }}
            onShowSizeChange={(_current, size) => {
              setPage(1);
              setLimit(size);
            }}
            rowKey="_id"
            loading={isLoading}
            total={totalRecord}
            titleHeaderColor="#000"
            isSelectionRow
            onSelectChange={(newSelect) => {
              setSelectedRowKeys(newSelect);
            }}
            selectedRowKeys={selectedRowKeys}
          />
        </div>
      </div>
    </>
  );
};

export default Inventory;
