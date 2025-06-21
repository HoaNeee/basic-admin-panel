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
import { useEffect, useState } from "react";
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

  useEffect(() => {
    getVariations(variation_id || "");
  }, []);

  const getVariations = async (id: string) => {
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
  };

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
              onClick={() => setOptionSelected(record)}
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
      {contextHolder}
      <div className="flex w-full h-full gap-6 relative">
        {(isDeleting || isLoading) && <Loading type="screen" />}
        <div className="w-2/5">
          <Card
            title={
              <p>
                Add option for{" "}
                <span className="underline">
                  {variation?.title || "variation"}
                </span>
              </p>
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
        <div className="flex-1">
          <Table dataSource={options} columns={columns} />
        </div>
      </div>
    </>
  );
};

export default VariationOptions;
