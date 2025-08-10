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
  const [dataSelectTree, setDataSelectTree] = useState<TreeSelectModel[]>([]);
  const [dataTableTree, setDataTableTree] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mesApi, contextHolderMes] = message.useMessage();
  const [categorySelected, setCategorySelected] = useState<CategoryModel>();

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    const dataSelect = categories.map((item: CategoryModel) => {
      return {
        value: item._id,
        parent_id: item.parent_id,
        title: item.title,
      };
    });

    const dataTable = categories.map((item: CategoryModel) => {
      return {
        ...item,
        key: item._id,
      };
    });
    setDataTableTree(createTree(dataTable, "", "_id"));
    setDataSelectTree(createTree(dataSelect, "", "value"));
  }, [categories]);

  const fetchAllCategories = async () => {
    try {
      setIsLoading(true);
      const response = await handleAPI("/categories");
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (record: CategoryModel) => {
    const api = `/categories/delete/${record._id}`;
    try {
      setIsDeleting(true);
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
      if (categorySelected?._id === record._id) {
        setCategorySelected(undefined);
      }
      setCategories(categories.filter((item) => item._id !== record._id));
    } catch (error: any) {
      console.log(error);
      mesApi.error(error.message);
    } finally {
      setIsDeleting(false);
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
      <div className="flex w-full h-full gap-6 relative md:flex-row flex-col">
        {(isLoading || isDeleting) && <Loading type="screen" />}
        <div className="md:w-2/5 w-full">
          <Card title="Add New Category">
            <AddCategory
              categories={dataSelectTree}
              onAddNew={(val) => {
                if (!categorySelected) {
                  fetchAllCategories();
                } else {
                  const arr = [...categories];
                  const index = arr.findIndex(
                    (item) => item._id === categorySelected._id
                  );
                  if (index !== -1) {
                    arr[index] = { ...val };
                    setCategories(arr);
                  }
                }
              }}
              mesApi={mesApi}
              select={categorySelected}
              onCancel={() => {
                setCategorySelected(undefined);
              }}
            />
          </Card>
        </div>
        <div className="md:w-3/5">
          <Card size="small">
            <Table
              size="small"
              columns={columns}
              dataSource={dataTableTree}

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
