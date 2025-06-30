/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, message, Popconfirm, Space, Tag } from "antd";
import MyTable from "../components/MyTable";
import { useEffect, useState } from "react";
import ModalAddPromotion from "../components/modals/ModalAddPromotion";
import { handleAPI } from "../apis/request";
import type { ColumnProps } from "antd/es/table";
import type { PromotionModel } from "../models/promotionModel";
import { FiEdit3 } from "react-icons/fi";
import { CiTrash } from "react-icons/ci";

const Promotions = () => {
  const [openModalAddPromotion, setOpenModalAddPromotion] = useState(false);
  const [promotions, setPromotions] = useState<PromotionModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [promotion, setPromotion] = useState<PromotionModel>();

  const [mesApi, contextHolderMes] = message.useMessage();

  useEffect(() => {
    getPromotions();
  }, []);

  const getPromotions = async () => {
    const api = `/promotions`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setPromotions(response.data);
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
        return <>{val ? <img src={val} alt="" /> : "-"}</>;
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
      render: (val: string, record) => {
        if (!record.endAt) {
          if (record.maxUse !== null && record.maxUse === 0) {
            return <Tag color="red">Out of uses</Tag>;
          }
          return <Tag color="green">In time</Tag>;
        }
        const start = new Date(record.startAt || "").getTime();
        const end = new Date(record.endAt).getTime();
        const now = new Date().getTime();
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

  return (
    <>
      {contextHolderMes}
      <div className="bg-white w-full h-full px-3 py-2 rounded-sm">
        <Flex justify="space-between" align="center">
          <div className="flex gap-4 items-center">
            <p className="text-xl font-medium">Promotions</p>
            {/* {selectedRowKeys.length > 0 && (
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
            )} */}
          </div>
          <Space size={5}>
            {/* <Input.Search
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
            /> */}
            {/* <Dropdown
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
            </Dropdown> */}
            {/* <Divider type="vertical" /> */}

            <Button
              type="primary"
              onClick={() => {
                setOpenModalAddPromotion(true);
              }}
            >
              Add Promotion
            </Button>
          </Space>
        </Flex>
        <div className="mt-4">
          <MyTable
            columns={columns}
            data={promotions}
            rowKey="_id"
            onChange={() => {}}
            onShowSizeChange={() => {}}
            loading={isLoading}
          />
        </div>
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
