/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { handleAPI } from "../apis/request";
import { Button, Card, message, Popconfirm, Space, Table } from "antd";
import AddVariation from "../components/AddVariation";
import type { ColumnProps } from "antd/es/table";
import type { VariationModel } from "../models/variationModel";
import { FiEdit3 } from "react-icons/fi";
import { CiTrash } from "react-icons/ci";
import Loading from "../components/Loading";
import { Link } from "react-router";

const Variations = () => {
  const [variations, setVariations] = useState<VariationModel[]>([]);
  const [variationSelected, setVariationSelected] = useState<VariationModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [mesApi, contextHolder] = message.useMessage();

  const prefix_api = `/variations`;

  const getVariations = useCallback(async () => {
    const api = prefix_api;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setVariations(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [prefix_api]);

  useEffect(() => {
    getVariations();
  }, [getVariations]);

  const handleDeleteItem = async (item: VariationModel) => {
    const api = `${prefix_api}/delete/${item._id}`;

    try {
      setIsDeleting(true);
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnProps<VariationModel>[] = [
    {
      key: "title",
      title: "Variation Name",
      dataIndex: "title",
      render(value, record) {
        return (
          <Link
            to={`/inventories/variations/options?id=${record._id}`}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            <span className="font-medium text-gray-900 hover:text-blue-600">
              {value}
            </span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        );
      },
      width: "40%",
    },
    {
      key: "desc",
      title: "Description",
      dataIndex: "description",
      render: (val: string) => (
        <div className="max-w-xs">
          {val ? (
            <span className="text-gray-600 text-sm line-clamp-2">{val}</span>
          ) : (
            <span className="text-gray-400 italic text-sm">No description</span>
          )}
        </div>
      ),
      width: "45%",
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "",
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              icon={<FiEdit3 size={16} />}
              onClick={() => setVariationSelected(record)}
              type="text"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit variation"
            />
            <Popconfirm
              title="Delete Variation"
              description="Are you sure you want to delete this variation? This will also delete all its options."
              onConfirm={() => {
                handleDeleteItem(record);
                setVariations(
                  variations.filter((item) => item._id !== record._id)
                );
              }}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<CiTrash size={16} />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete variation"
              />
            </Popconfirm>
          </Space>
        );
      },
      width: "15%",
      fixed: "right",
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      {(isDeleting || isLoading) && <Loading type="screen" />}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Variations Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage product variations like size, color, material, etc.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {variations.length} variations
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Add Variation Form */}
        <div className="xl:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">
                  {variationSelected ? "Edit Variation" : "Add New Variation"}
                </span>
              </div>
            }
            className="shadow-sm border-0"
            styles={{
              header: {
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              },
            }}
          >
            <AddVariation
              mesApi={mesApi}
              select={variationSelected}
              onCancel={() => {
                setVariationSelected(undefined);
              }}
              onAddNew={(val) => {
                if (!variationSelected) {
                  setVariations([val, ...variations]);
                } else {
                  const arr = [...variations];
                  const index = arr.findIndex((item) => item._id === val._id);
                  if (index !== -1) {
                    arr[index] = { ...val };
                    setVariations(arr);
                  }
                }
              }}
              prefix_api={prefix_api}
            />
          </Card>
        </div>

        {/* Variations Table */}
        <div className="xl:col-span-3 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">Variations List</span>
                </div>
                <div className="text-sm text-gray-500">
                  {variations.length} items
                </div>
              </div>
            }
            className="shadow-sm border-0"
            styles={{
              header: {
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              },
              body: {
                padding: 0,
              },
            }}
          >
            <Table
              dataSource={variations}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} variations`,
                className: "px-6 py-4",
              }}
              scroll={{
                x: "100%",
              }}
              className="border-none"
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiEdit3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No variations yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first product variation like size, color, or
                      material
                    </p>
                  </div>
                ),
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Variations;
