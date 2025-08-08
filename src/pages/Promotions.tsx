/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import ModalAddPromotion from "../components/modals/ModalAddPromotion";
import { handleAPI } from "../apis/request";
import type { ColumnProps } from "antd/es/table";
import type { PromotionModel } from "../models/promotionModel";
import { FiEdit3 } from "react-icons/fi";
import { CiTrash } from "react-icons/ci";
import TableFilter from "../components/TableFilter";

const Promotions = () => {
  const [openModalAddPromotion, setOpenModalAddPromotion] = useState(false);
  const [promotions, setPromotions] = useState<PromotionModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promotion, setPromotion] = useState<PromotionModel>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [valuesFilter, setValuesFilter] = useState<any>();
  const [filter, setFilter] = useState<any>();
  const [keyword, setKeyword] = useState("");
  const [totalRecord, setTotalRecord] = useState(10);

  const [mesApi, contextHolderMes] = message.useMessage();

  useEffect(() => {
    getPromotions();
  }, [page, limit, keyword, filter]);

  const getPromotions = async () => {
    const api = `/promotions?page=${page}&limit=${limit}&keyword=${keyword}&status=${
      filter?.status || ""
    }&promotionType=${filter?.promotionType || ""}`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setPromotions(response.data.promotions);
      setTotalRecord(response.data.totalRecord);
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const api = `/promotions/delete/${id}`;
    try {
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
      setPromotions(promotions.filter((it) => it._id !== id));
    } catch (error: any) {
      mesApi.error(error.message);
    }
  };

  const columns: ColumnProps<PromotionModel>[] = [
    {
      key: "title",
      title: "Title",
      dataIndex: "title",
    },
    {
      key: "thum",
      title: "Thumbnail",
      dataIndex: "thumbnail",
      render: (val: any) => {
        return (
          <>
            {val ? (
              <div className="w-20 h-20">
                <img src={val} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      key: "code",
      title: "CODE",
      dataIndex: "code",
      render: (val: string) => {
        return <>{val ? val : "-"}</>;
      },
    },
    {
      key: "value",
      title: "Value",
      dataIndex: "value",
      render: (val: number, record) => {
        return (
          <>
            {val
              ? record.promotionType === "percent"
                ? val + " %"
                : val.toLocaleString()
              : "-"}
          </>
        );
      },
    },
    {
      key: "start",
      title: "Start",
      dataIndex: "startAt",
      render: (val: string) => {
        return <>{val ? new Date(val).toLocaleString() : "-"}</>;
      },
    },
    {
      key: "end",
      title: "End",
      dataIndex: "endAt",
      render: (val: string) => {
        return <>{val ? new Date(val).toLocaleString() : "-"}</>;
      },
    },

    {
      key: "Remaning",
      title: "Remaning",
      dataIndex: "maxUse",
      render: (val: number) => {
        return <>{val !== null && val !== undefined ? val : "-"}</>;
      },
    },
    {
      key: "expired",
      title: "Status",
      dataIndex: "promotionType",
      render: (_val, record) => {
        if (!record.endAt) {
          if (record.maxUse !== null && record.maxUse === 0) {
            return <Tag color="red">Out of uses</Tag>;
          }
          return <Tag color="green">In time</Tag>;
        }
        const start = new Date(record.startAt || "").getTime();
        const end = new Date(record.endAt).getTime();
        const now = new Date().getTime();
        if (start > now) {
          return <Tag color="blue">Upcoming</Tag>;
        }
        if (end < now || start > end) {
          return <Tag color="red">Expired</Tag>;
        }

        return <Tag color="green">In time</Tag>;
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
              onClick={() => {
                setPromotion(record);
                setOpenModalAddPromotion(true);
              }}
              type="text"
            />
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDeleteItem(record._id)}
            >
              <Button type="text" icon={<CiTrash size={15} />} danger />
            </Popconfirm>
          </Space>
        );
      },
      fixed: "right",
    },
  ];

  const renderFilterContent = () => {
    return (
      <div className="flex gap-2 flex-col">
        <Select
          placeholder="Promotion Type"
          className="w-full"
          value={valuesFilter?.promotionType || undefined}
          onChange={(val) => {
            setValuesFilter({ ...valuesFilter, promotionType: val });
          }}
        >
          <Select.Option value="percent">Percent</Select.Option>
          <Select.Option value="discount">Amount</Select.Option>
        </Select>
        <Select
          placeholder="Status"
          className="w-full"
          value={valuesFilter?.status || undefined}
          onChange={(val) => {
            setValuesFilter({ ...valuesFilter, status: val });
          }}
        >
          <Select.Option value="intime">In Time</Select.Option>
          <Select.Option value="upcoming">Upcoming</Select.Option>
          <Select.Option value="expired">Expired</Select.Option>
        </Select>
      </div>
    );
  };

  return (
    <>
      {contextHolderMes}
      <div className="bg-white w-full h-full px-3 py-2 rounded-sm">
        <TableFilter
          title="Promotions"
          onSearch={(val) => {
            setKeyword(val);
            setPage(1);
          }}
          extra={
            <Button
              type="primary"
              onClick={() => {
                setOpenModalAddPromotion(true);
              }}
            >
              Add Promotion
            </Button>
          }
          filter={renderFilterContent()}
          onFilter={() => {
            setFilter(valuesFilter);
            setPage(1);
          }}
          onClearFilter={() => {
            setValuesFilter(undefined);
            setFilter(undefined);
            setPage(1);
          }}
        >
          <Table
            columns={columns}
            dataSource={promotions}
            rowKey="_id"
            loading={isLoading}
            scroll={{
              x: "800px",
              y: "calc(100vh - 200px)",
            }}
            pagination={{
              current: page,
              total: totalRecord,
              pageSize: limit,
              onChange: (page, pageSize) => {
                setPage(page);
                setLimit(pageSize);
              },
              hideOnSinglePage: true,
            }}
          />
        </TableFilter>
      </div>
      <ModalAddPromotion
        isOpen={openModalAddPromotion}
        onClose={() => {
          setOpenModalAddPromotion(false);
          setPromotion(undefined);
        }}
        mesApi={mesApi}
        promotion={promotion}
        onFetch={async () => {
          await getPromotions();
        }}
      />
    </>
  );
};

export default Promotions;
