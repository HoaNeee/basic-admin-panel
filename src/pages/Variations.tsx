/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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

  useEffect(() => {
    getVariations();
  }, []);

  const getVariations = async () => {
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
  };

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
      title: "Title",
      dataIndex: "title",
      render(value, record) {
        return (
          <Link to={`/inventories/variations/options?id=${record._id}`}>
            {value}{" "}
          </Link>
        );
      },
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
              onClick={() => setVariationSelected(record)}
              type="text"
            />
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => {
                handleDeleteItem(record);
                setVariations(
                  variations.filter((item) => item._id !== record._id)
                );
              }}
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
      {contextHolder}
      <div className="flex w-full h-full gap-6 relative">
        {(isDeleting || isLoading) && <Loading type="screen" />}
        <div className="w-2/5">
          <Card title="Add variations">
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
        <div className="flex-1">
          <Table dataSource={variations} columns={columns} />
        </div>
      </div>
    </>
  );
};

export default Variations;
