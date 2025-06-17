/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, message, Popconfirm, Space, Table } from "antd";
import type { ColumnProps } from "antd/es/table";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import { type CategoryModel } from "../models/categoryModel";
import { CiTrash } from "react-icons/ci";
import { FiEdit3 } from "react-icons/fi";
import AddCategory from "../components/AddCategory";
import { createTree } from "../helpers/createTree";
import Loading from "../components/Loading";
import type { TreeSelectModel } from "../models/formModel";

const Category = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<TreeSelectModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mesApi, contextHolderMes] = message.useMessage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [totalRecord, setTotalRecord] = useState(1);
  const [categorySelected, setCategorySelected] = useState<CategoryModel>();

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    getCategories();
  }, [page, limit]);

  const getData = async (api: string) => {
    try {
      setIsLoading(true);
      const response: any = await handleAPI(api);
      return {
        data: response.data,
        totalRecord: response.totalRecord,
      };
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    const data = await getData("/categories");
    const dataTree = data?.data.map((item: any) => {
      return {
        value: item._id,
        parent_id: item.parent_id,
        title: item.title,
      };
    });
    setCategoriesTree(createTree(dataTree));
  };

  const getCategories = async () => {
    const api = `/categories?page=${page}&limit=${limit}`;
    const data = await getData(api);
    setCategories(data?.data);
    setTotalRecord(data?.totalRecord);
  };

  const handleDeleteItem = async (record: CategoryModel) => {
    const api = `/categories/delete/${record._id}`;
    try {
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
      setCategories(categories.filter((item) => item._id !== record._id));
      let arrTree = [...categoriesTree];

      const findAndDel = (arr: any[], id: string, parent: any = {}) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].value === id) {
            const index = parent.children.findIndex(
              (item: any) => item.value === id
            );
            if (index !== -1) {
              parent.children.splice(index, 1);
            }
          } else if (arr[i].children.length > 0) {
            findAndDel(arr[i].children, id, arr[i]);
          }
        }
      };

      if (record.parent_id === "") {
        arrTree = arrTree.filter((item) => item.value !== record._id);
      } else {
        findAndDel(arrTree, record._id);
      }

      setCategoriesTree(arrTree);
    } catch (error: any) {
      console.log(error);
      mesApi.error(error.message);
    }
  };

  const columns: ColumnProps<CategoryModel>[] = [
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
    },
    {
      key: "desc",
      title: "description",
      dataIndex: "description",
      render: (val: any) => {
        return <>{val ? val : "-"}</>;
      },
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "",
      render: (_, record) => {
        return (
          <Space size={"small"}>
            <Button
              icon={<FiEdit3 size={15} />}
              onClick={() => setCategorySelected(record)}
              type="text"
            />
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDeleteItem(record)}
            >
              <Button type="text" icon={<CiTrash size={15} />} danger />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
    },
  ];

  return (
    <>
      {contextHolderMes}
      <div className="flex w-full h-full gap-6 relative">
        {isLoading && <Loading type="screen" />}
        <div className="w-2/5">
          <Card title="Add New Category">
            <AddCategory
              categories={categoriesTree}
              onAddNew={(val) => {
                if (!categorySelected) {
                  fetchAllCategories();
                  if (categories.length === limit) {
                    const arr = [...categories];
                    arr.splice(arr.length - 1, 1);
                    setCategories([val, ...arr]);
                  }
                } else {
                  const arr = [...categories];
                  const idx = arr.findIndex((item) => item._id === val._id);
                  if (idx !== -1) {
                    arr[idx] = { ...val };
                    setCategories(arr);
                  }

                  const arrTree: any = [...categoriesTree];

                  const dfsParent = (
                    data: any[] = [],
                    id: string,

                    item: any,
                    type = 1,
                    idChild = ""
                  ) => {
                    for (let i = 0; i < data.length; i++) {
                      if (data[i].value === id) {
                        if (type === 1) {
                          const index = data[i].children.findIndex(
                            (i: any) => i.value === idChild
                          );
                          if (index !== -1) {
                            data[i].children.splice(index, 1);
                          }
                        } else {
                          data[i].children.push(item);
                        }
                        return;
                      } else if (
                        data[i].children &&
                        data[i].children.length > 0
                      ) {
                        dfsParent(data[i].children, id, item, type, idChild);
                      }
                    }
                  };

                  const dfs = (data: any[] = [], id: any) => {
                    for (let i = 0; i < data.length; i++) {
                      if (data[i].value === id) {
                        const item = {
                          ...data[i],
                        };

                        item.title = val.title;
                        item.parent_id = val.parent_id;
                        if (data[i].parent_id !== val.parent_id) {
                          if (!data[i].parent_id || data[i].parent_id === "") {
                            arrTree.splice(i, 1);
                          } else {
                            dfsParent(
                              arrTree,
                              data[i].parent_id,
                              data[i],
                              1,
                              data[i].value
                            );
                          }

                          if (val.parent_id === "") {
                            arrTree.push(item);
                            return;
                          }

                          dfsParent(arrTree, val.parent_id, item, 2);
                        } else {
                          data[i].title = val.title;
                        }

                        return;
                      }
                      if (data[i].children && data[i].children.length > 0) {
                        dfs(data[i].children, id);
                      }
                    }
                  };

                  dfs(arrTree, val._id);

                  setCategoriesTree(arrTree);
                }
              }}
              mesApi={mesApi}
              documentSelect={categorySelected}
              onCancel={() => {
                setCategorySelected(undefined);
              }}
            />
          </Card>
        </div>
        <div className="w-3/5">
          <Card size="small">
            <Table
              size="small"
              columns={columns}
              dataSource={categories}
              rowKey={"_id"}
              pagination={{
                total: totalRecord,
                showSizeChanger: true,
                onShowSizeChange(_, size) {
                  setLimit(size);
                },

                onChange(page, pageSize) {
                  setPage(page);
                  setLimit(pageSize);
                },
                pageSize: limit,
              }}
              // scroll={{
              //   y: 480,
              //   x: "100%",
              // }}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Category;
