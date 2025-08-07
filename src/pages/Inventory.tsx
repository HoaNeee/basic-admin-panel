/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback } from "react";
import { handleAPI } from "../apis/request";
import MyTable from "../components/MyTable";
import {
  Button,
  Divider,
  Dropdown,
  Input,
  message,
  Modal,
  Popconfirm,
  Tag,
  Badge,
} from "antd";
import {
  FiPackage,
  FiEdit3,
  FiTrash2,
  FiFilter,
  FiPlus,
  FiDownload,
  FiImage,
  FiTag,
  FiDollarSign,
  FiBox,
  FiLayers,
  FiSearch,
  FiMoreVertical,
} from "react-icons/fi";
import type { ColumnType } from "antd/es/table";
import { Link, useNavigate } from "react-router";
import type { ProductModel } from "../models/productModel";
import type { CategoryModel } from "../models/categoryModel";
import { RiSubtractFill } from "react-icons/ri";
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
  }, [valueFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getProducts = useCallback(
    async (keyword: string = "") => {
      const api =
        prefix_api + `?page=${page}&limit=${limit}&keyword=${keyword}`;
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
    },
    [page, limit, mesApi]
  );

  const handleFilter = useCallback(
    async (values: any, keyword: string = "") => {
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
    },
    [page, limit, mesApi]
  );

  const getCategories = useCallback(async () => {
    const api = `/categories`;
    try {
      const response = await handleAPI(api);
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

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
            setPage(page - 1);
            setSelectedRowKeys([]);
          } else {
            await getProducts();
          }
          setSelectedRowKeys([]);
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
    {
      key: "title",
      dataIndex: "title",
      title: (
        <div className="flex items-center gap-2">
          <FiPackage className="w-4 h-4 text-gray-600" />
          <span>Product Name</span>
        </div>
      ),
      render: (value, record, index) => {
        return value ? (
          <Link
            to={`/inventories/edit-product/${record._id}`}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            {value}
          </Link>
        ) : (
          <span className="text-gray-400">
            <RiSubtractFill key={index} />
          </span>
        );
      },
      width: 200,
    },
    {
      key: "thumbnail",
      dataIndex: "thumbnail",
      title: (
        <div className="flex items-center gap-2">
          <FiImage className="w-4 h-4 text-gray-600" />
          <span>Image</span>
        </div>
      ),
      render: (value) => {
        return value ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={value}
              className="w-full h-full object-cover"
              alt="Product thumbnail"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
            <FiImage className="w-6 h-6 text-gray-400" />
          </div>
        );
      },
      width: 80,
    },
    {
      key: "short",
      dataIndex: "shortDescription",
      title: (
        <div className="flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-gray-600" />
          <span>Description</span>
        </div>
      ),
      render: (value, _record, index) => {
        return value ? (
          <div className="max-w-xs">
            <p className="text-gray-700 line-clamp-2 text-sm">{value}</p>
          </div>
        ) : (
          <span className="text-gray-400">
            <RiSubtractFill key={index} />
          </span>
        );
      },
      width: 200,
    },
    {
      key: "categories",
      dataIndex: "categories",
      title: (
        <div className="flex items-center gap-2">
          <FiTag className="w-4 h-4 text-gray-600" />
          <span>Categories</span>
        </div>
      ),
      render: (values, _record, index) => {
        if (!values || values.length <= 0) {
          return (
            <span className="text-gray-400">
              <RiSubtractFill />
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((id: string) => {
              if (!id) return <RiSubtractFill key={index} />;
              const item = categories.find((item) => item._id === id);
              return (
                <Tag
                  key={id}
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 rounded-full px-2 py-1"
                >
                  {item?.title}
                </Tag>
              );
            })}
          </div>
        );
      },
      width: 150,
    },
    {
      key: "SKU",
      dataIndex: "SKU",
      title: (
        <div className="flex items-center gap-2">
          <FiBox className="w-4 h-4 text-gray-600" />
          <span>SKU</span>
        </div>
      ),
      render: (value, _record, index) => {
        return value ? (
          <span className="font-mono text-xs px-2 py-1 rounded text-gray-700">
            {value}
          </span>
        ) : (
          <span className="text-gray-400">
            <RiSubtractFill key={index} />
          </span>
        );
      },
      width: 120,
    },
    {
      key: "price",
      dataIndex: "price",
      title: (
        <div className="flex items-center gap-2">
          <FiDollarSign className="w-4 h-4 text-gray-600" />
          <span>Price</span>
        </div>
      ),
      render: (value: number, record, index) => {
        if (value !== null && value !== undefined) {
          if (record.productType !== "variations") {
            return (
              <span className="font-semibold text-emerald-600">
                {VND.format(value)}
              </span>
            );
          }
          if (
            record?.rangePrice &&
            (record.rangePrice.min || record.rangePrice.max)
          ) {
            return (
              <div className="text-sm">
                <span className="text-emerald-600 font-medium">
                  {VND.format(record?.rangePrice?.min)}
                </span>
                <span className="text-gray-400 mx-1">-</span>
                <span className="text-emerald-600 font-medium">
                  {VND.format(record?.rangePrice?.max)}
                </span>
              </div>
            );
          }
          return (
            <span className="text-gray-400">
              <RiSubtractFill key={index} />
            </span>
          );
        }
        return (
          <span className="text-gray-400">
            <RiSubtractFill key={index} />
          </span>
        );
      },
      width: 120,
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: (
        <div className="flex items-center gap-2">
          <FiBox className="w-4 h-4 text-gray-600" />
          <span>Stock</span>
        </div>
      ),
      render: (value: number, record, index) => {
        if (
          value !== null &&
          value !== undefined &&
          value &&
          record.productType !== "variations"
        ) {
          const stockLevel = value > 10 ? "high" : value > 5 ? "medium" : "low";
          const stockColor =
            stockLevel === "high"
              ? "text-green-600"
              : stockLevel === "medium"
              ? "text-yellow-600"
              : "text-red-600";

          return (
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${stockColor}`}>{value}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  stockLevel === "high"
                    ? "bg-green-500"
                    : stockLevel === "medium"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
            </div>
          );
        } else if (record?.rangeStock) {
          return (
            <span className="text-gray-700 font-medium">
              {record?.rangeStock}
            </span>
          );
        }
        return (
          <span className="text-gray-400">
            <RiSubtractFill key={index} />
          </span>
        );
      },
      width: 100,
    },
    {
      key: "productType",
      dataIndex: "productType",
      title: (
        <div className="flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-gray-600" />
          <span>Type</span>
        </div>
      ),
      render: (value) => {
        const typeConfig = {
          simple: {
            color: "bg-blue-50 text-blue-700 border-blue-200",
            label: "Simple",
          },
          variations: {
            color: "bg-purple-50 text-purple-700 border-purple-200",
            label: "Variable",
          },
        };

        const config = typeConfig[value as keyof typeof typeConfig];

        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
              config?.color || "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {config?.label || value}
          </span>
        );
      },
      width: 100,
    },
    {
      key: "action",
      dataIndex: "",
      title: (
        <div className="flex items-center gap-2">
          <FiMoreVertical className="w-4 h-4 text-gray-600" />
          <span>Actions</span>
        </div>
      ),
      render: (_, record) => {
        return (
          <div className="flex items-center gap-1">
            <Button
              type="text"
              size="small"
              icon={<FiEdit3 className="w-4 h-4" />}
              onClick={() => {
                navigate(`/inventories/edit-product/${record._id}`);
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              title="Edit product"
            />
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDeleteProduct(record._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                icon={<FiTrash2 className="w-4 h-4" />}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                title="Delete product"
              />
            </Popconfirm>
          </div>
        );
      },
      fixed: "right",
      width: 100,
    },
  ];

  return (
    <>
      {contextHolder}
      {contextHolderModal}
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Product Inventory
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your product catalog and stock levels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Products</div>
                <div className="text-lg font-semibold text-gray-900">
                  {totalRecord || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Low Stock Items</div>
                <div className="text-lg font-semibold text-amber-600">
                  {
                    products.filter(
                      (p) =>
                        p.stock && typeof p.stock === "number" && p.stock <= 5
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiBox className="w-5 h-5 text-gray-600" />
                Products
              </h2>
              {selectedRowKeys.length > 0 && (
                <div className="flex items-center md:gap-6 gap-2">
                  <Badge count={selectedRowKeys.length} className="">
                    <span className="text-sm">Selected</span>
                  </Badge>
                  <Dropdown
                    placement="bottomLeft"
                    arrow
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "delete",
                          label: (
                            <div className="flex items-center gap-2 text-red-600">
                              <FiTrash2 className="w-4 h-4" />
                              <span>Delete Selected</span>
                            </div>
                          ),
                          onClick: confirm,
                        },
                      ],
                    }}
                  >
                    <Button icon={<FiMoreVertical className="w-4 h-4" />}>
                      Bulk Actions
                    </Button>
                  </Dropdown>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Input.Search
                placeholder="Search products..."
                allowClear
                className="w-64"
                prefix={<FiSearch className="w-4 h-4 text-gray-400" />}
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
              />
              <Dropdown
                trigger={["click"]}
                arrow
                placement="bottomRight"
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
                <Button icon={<FiFilter className="w-4 h-4" />}>Filters</Button>
              </Dropdown>
              <Divider type="vertical" className="h-6" />
              <Button
                icon={<FiDownload className="w-4 h-4" />}
                onClick={() => {}}
                className="flex items-center gap-2"
              >
                Export
              </Button>
              <Link to="/inventories/add-new-product">
                <Button
                  type="primary"
                  icon={<FiPlus className="w-4 h-4" />}
                  className="flex items-center gap-2"
                >
                  Add Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="inventories-table">
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
                showSizeChanger: true,
                pageSize: limit,
                current: page,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
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
              className="border-none"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
