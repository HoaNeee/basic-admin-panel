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
  Modal,
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
import FilterProduct from "../components/filter/FilterProduct";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { VND } from "../helpers/formatCurrency";

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
  const [isUpdating, setIsUpdating] = useState(false);

  const [mesApi, contextHolder] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();

  const navigate = useNavigate();

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (!isFilter) {
      getProducts(keyword);
    } else {
      handleFilter(valueFilter, keyword);
    }
  }, [page, limit]);

  useEffect(() => {
    if (isFilter && keyword) {
      handleFilter(valueFilter, keyword);
    } else if (keyword) {
      if (page !== 1) {
        setPage(1);
      } else {
        getProducts(keyword);
      }
    }
  }, [keyword]);

  useEffect(() => {
    if (isFilter) {
      handleFilter(valueFilter, keyword);
    }
  }, [valueFilter]);

  const getProducts = async (keyword: string = "") => {
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

  const handleFilter = async (values: any, keyword: string = "") => {
    try {
      setIsLoading(true);
      const api = `/products/filter-product?keyword=${keyword}&page=${page}&limit=${limit}`;
      const response = await handleAPI(api, values, "post");
      setProducts(response.data.products);
      setTotalRecord(response.data.totalRecord);
    } catch (error: any) {
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

  const confirm = () => {
    modal.confirm({
      content: `Are you sure? You selected ${selectedRowKeys.length} items`,
      closable: true,
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      okText: "OK",
      cancelText: "Cancel",
      onOk: async () => {
        const api = `/products/change-multi`;
        try {
          setIsUpdating(true);
          const key = "delete-items";
          mesApi.open({
            key,
            type: "loading",
            content: "Loading...",
          });

          const response: any = await handleAPI(
            api,
            {
              action: "delete-all",
              payload: selectedRowKeys,
            },
            "patch"
          );
          mesApi.open({
            key,
            type: "success",
            content: response.message,
          });
          if (selectedRowKeys.length === products.length) {
            // setTotalRecord(totalRecord - selectedRowKeys.length);
            setPage(page - 1);
            setSelectedRowKeys([]);
          } else {
            await getProducts();
          }
        } catch (error: any) {
          mesApi.error(error.message);
        } finally {
          setIsUpdating(false);
        }
      },

      okButtonProps: {
        disabled: isUpdating,
      },
    });
  };

  const handleDeleteProduct = async (product_id: string) => {
    const api = `/products/delete/${product_id}`;
    try {
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
      if (isFilter) {
        await handleFilter(valueFilter, keyword);
      } else {
        await getProducts();
      }
    } catch (error: any) {
      mesApi.error(error.message);
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
      key: "SKU",
      dataIndex: "SKU",
      title: "SKU",
      render: (value, _record, index) => {
        return value ? value : <RiSubtractFill key={index} />;
      },
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      render: (value: number, record, index) => {
        if (value !== null && value !== undefined) {
          if (record.productType !== "variations") {
            return "" + VND.format(value);
          }
          if (
            record?.rangePrice &&
            (record.rangePrice.min || record.rangePrice.max)
          ) {
            return `${VND.format(record?.rangePrice?.min)} - ${VND.format(
              record?.rangePrice?.max
            )}`;
          }
          return <RiSubtractFill key={index} />;
        }
        return <RiSubtractFill key={index} />;
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
      title: "Type",
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
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDeleteProduct(record._id)}
            >
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
      {contextHolderModal}
      <div className="bg-white w-full h-full px-3 py-2 rounded-sm flex flex-col">
        <Flex justify="space-between" align="center">
          <div className="flex gap-4 items-center">
            <p className="text-lg font-medium">Products</p>
            {selectedRowKeys.length > 0 && (
              <>
                <p>{selectedRowKeys.length} selected</p>
                <Dropdown
                  placement="bottom"
                  arrow
                  trigger={["click"]}
                  popupRender={() => {
                    return (
                      <div className="dropdown-filter w-60 bg-white p-5 flex flex-col gap-2">
                        <Button block onClick={confirm}>
                          Delete All
                        </Button>
                        <Button block>---------</Button>
                      </div>
                    );
                  }}
                >
                  <Button>Option</Button>
                </Dropdown>
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
                    onFilter={async (values: any) => {
                      setIsFilter(true);
                      setValueFilter(values);
                    }}
                    onClear={async () => {
                      setIsFilter(false);
                      await getProducts(keyword);
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
        <div className="mt-4 h-full inventories-table">
          <MyTable
            columns={columns}
            data={products}
            pagination={{
              onChange(page, pageSize) {
                setPage(page);
                setLimit(pageSize);
              },
              total: totalRecord,
              showQuickJumper: true,
              pageSize: limit,
              current: page,
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
