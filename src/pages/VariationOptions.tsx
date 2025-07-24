/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, message, Popconfirm, Space, Table } from "antd";
import Loading from "../components/Loading";
import { CiTrash } from "react-icons/ci";
import { FiEdit3 } from "react-icons/fi";
import type { ColumnProps } from "antd/es/table";
import { handleAPI } from "../apis/request";
import {
  type VariationModel,
  type VariationOptionModel,
} from "../models/variationModel";
import { useEffect, useState, useCallback } from "react";
import AddVariationOption from "../components/AddVariationOption";
import { useLocation } from "react-router";

const VariationOptions = () => {
  const [options, setOptions] = useState<VariationOptionModel[]>([]);
  const [optionSelected, setOptionSelected] = useState<VariationOptionModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [variation, setVariation] = useState<VariationModel>();

  const [mesApi, contextHolder] = message.useMessage();

  const location = useLocation();
  const variation_id = new URLSearchParams(location.search).get("id");

  const p_api = `/variation-options`;

  const getVariations = useCallback(
    async (id: string) => {
      const api = p_api + `?variation_id=${id}`;
      try {
        setIsLoading(true);
        const response: any = await handleAPI(api);
        setVariation(response.variation);
        setOptions(response.data);
      } catch (error: any) {
        console.log(error);
        mesApi.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [p_api, mesApi]
  );

  useEffect(() => {
    if (variation_id) {
      getVariations(variation_id);
    }
  }, [variation_id, getVariations]);

  const handleDeleteItem = async (item: VariationOptionModel) => {
    const api = `${p_api}/delete/${item._id}`;

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

  const columns: ColumnProps<VariationOptionModel>[] = [
    {
      key: "title",
      title: "Option Name",
      dataIndex: "title",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
          <span className="font-medium text-gray-900">{text}</span>
        </div>
      ),
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
              onClick={() => setOptionSelected(record)}
              type="text"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit option"
            />
            <Popconfirm
              title="Delete Option"
              description="Are you sure you want to delete this option? This action cannot be undone."
              onConfirm={() => {
                handleDeleteItem(record);
                setOptions(options.filter((item) => item._id !== record._id));
              }}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<CiTrash size={16} />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete option"
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
            Variation Options
            {variation?.title && (
              <span className="text-lg font-normal text-blue-600 ml-2">
                • {variation.title}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            Manage options for this variation type
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {options.length} options
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Add Option Form */}
        <div className="xl:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold">
                  {optionSelected ? "Edit Option" : "Add New Option"}
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
            extra={
              variation?.title && (
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  for {variation.title}
                </div>
              )
            }
          >
            <AddVariationOption
              variation={variation}
              vaiation_id={variation_id || ""}
              mesApi={mesApi}
              select={optionSelected}
              onCancel={() => {
                setOptionSelected(undefined);
              }}
              onAddNew={(val) => {
                if (!optionSelected) {
                  setOptions([val, ...options]);
                } else {
                  const arr = [...options];
                  const index = arr.findIndex((item) => item._id === val._id);
                  if (index !== -1) {
                    arr[index] = { ...val };
                    setOptions(arr);
                  }
                }
              }}
              p_api={p_api}
            />
          </Card>
        </div>

        {/* Options Table */}
        <div className="xl:col-span-3 space-y-6">
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">Options List</span>
                </div>
                <div className="text-sm text-gray-500">
                  {options.length} items
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
              dataSource={options}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} options`,
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
                      No options yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first option for this variation
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

export default VariationOptions;
