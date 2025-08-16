/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { handleAPI } from "../../apis/request";
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
} from "antd";
import {
  RedoOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { MessageInstance } from "antd/es/message/interface";
import type { PaginationConfig } from "antd/es/pagination";

interface Props {
  dataSource: any[];
  rowKey?: string;
  loading?: boolean;
  onSearch?: (keyword: string) => void;
  renderItem?: (item: any) => React.ReactNode;
  pagination?: PaginationConfig | undefined;
  messageApi?: MessageInstance;
  tabName: string;
  api_change_trash: string;
  api_bulk: string;
  api_all: string;
  selectedKeys: string[];
  setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>;
  onFetch?: () => void;
}

const ListDataTrash = (props: Props) => {
  const {
    dataSource,
    rowKey,
    loading,
    onSearch,
    renderItem,
    pagination,
    messageApi,
    tabName,
    api_change_trash,
    api_bulk,
    api_all,
    selectedKeys,
    setSelectedKeys,
    onFetch,
  } = props;
  const [checkedSubProduct, setCheckedSubProduct] = useState<string>("");
  const [changing, setChanging] = useState(false);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [typeAction, setTypeAction] = useState<{
    action: "restore" | "delete";
    type: "all" | "selected";
  }>();

  const handleRestore = async (id: string) => {
    try {
      setChanging(true);
      const api = `${api_change_trash}/${id}?type=restore`;
      const response: any = await handleAPI(
        api,
        tabName === "product"
          ? {
              checkedSubProduct: !!checkedSubProduct,
            }
          : undefined,
        "patch"
      );
      messageApi?.success(response.message || "Product restored successfully");
      setCheckedSubProduct("");
      onFetch?.();
      setSelectedKeys((prev) => prev.filter((key) => key !== id));
    } catch (error: any) {
      console.log(error);
      messageApi?.error(error.message || "An error occurred");
    } finally {
      setChanging(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setChanging(true);
      const api = `${api_change_trash}/${id}?type=delete`;
      const response: any = await handleAPI(
        api,
        tabName === "product"
          ? {
              checkedSubProduct: !!checkedSubProduct,
            }
          : undefined,
        "patch"
      );
      messageApi?.success(response.message || "Product deleted successfully");
      setCheckedSubProduct("");
      onFetch?.();
      setSelectedKeys((prev) => prev.filter((key) => key !== id));
    } catch (error: any) {
      console.log(error);
      messageApi?.error(error.message || "An error occurred");
    } finally {
      setChanging(false);
    }
  };

  const popConfirm = ({
    children,
    item,
    type,
  }: {
    children: React.ReactNode;
    item: Record<string, any>;
    type: "restore" | "delete";
  }) => {
    return (
      <Popconfirm
        onOpenChange={(open) => {
          if (!open) {
            setCheckedSubProduct("");
          }
        }}
        title={
          <div className="flex flex-col gap-2">
            <p>
              Are you sure to {type} this {tabName}?
            </p>
            {tabName === "product" &&
            item.productType === "variations" &&
            item.count_sub_product ? (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={checkedSubProduct === item._id}
                  onChange={(e) =>
                    setCheckedSubProduct(e.target.checked ? item._id : "")
                  }
                  id={`sub-product-${item._id}`}
                />
                <label htmlFor={`sub-product-${item._id}`}>
                  {type === "restore" ? "Restore" : "Delete"} all{" "}
                  {item.count_sub_product} sub products of this product
                </label>
              </div>
            ) : null}
          </div>
        }
        onConfirm={() =>
          type === "restore"
            ? handleRestore(item[`${rowKey}`] || item._id)
            : handleDelete(item[`${rowKey}`] || item._id)
        }
        okButtonProps={{
          loading: changing,
        }}
      >
        {children}
      </Popconfirm>
    );
  };

  return (
    <>
      <div className="w-full h-full">
        <div className="md:items-center md:flex-row flex flex-col justify-between my-3">
          {dataSource && dataSource?.length > 0 ? (
            <div className="md:text-base flex items-center gap-2 text-sm">
              <Checkbox
                id="check-all"
                checked={
                  selectedKeys?.length === dataSource?.length &&
                  dataSource?.length > 0
                }
                indeterminate={
                  selectedKeys?.length > 0 &&
                  selectedKeys?.length < dataSource?.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys(dataSource?.map((item) => item._id));
                  } else {
                    setSelectedKeys([]);
                  }
                }}
              />
              <label htmlFor="check-all">Check All</label>
              {selectedKeys?.length > 0 && (
                <div className="md:ml-4 flex items-center gap-3">
                  <p className="md:text-base text-sm">
                    Selected {selectedKeys?.length} items
                  </p>
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        {
                          key: "restore",
                          label: "Restore Selected",
                          onClick: () => {
                            setOpenModalConfirm(true);
                            setTypeAction({
                              action: "restore",
                              type: "selected",
                            });
                          },
                        },
                        {
                          key: "delete",
                          label: "Delete Forever",
                          danger: true,
                          onClick: () => {
                            setOpenModalConfirm(true);
                            setTypeAction({
                              action: "delete",
                              type: "selected",
                            });
                          },
                        },
                      ],
                    }}
                  >
                    <Button>Bulk Actions</Button>
                  </Dropdown>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="md:flex-row md:mt-0 flex flex-col items-center gap-4 mt-3">
            <Input.Search
              placeholder="Search..."
              onSearch={(value) => onSearch?.(value)}
              allowClear
            />
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  onFetch?.();
                }}
              >
                Refresh
              </Button>
              <Button
                icon={<RedoOutlined />}
                onClick={() => {
                  setOpenModalConfirm(true);
                  setTypeAction({
                    action: "restore",
                    type: "all",
                  });
                }}
              >
                Restore All
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setOpenModalConfirm(true);
                  setTypeAction({
                    action: "delete",
                    type: "all",
                  });
                }}
              >
                Delete All
              </Button>
            </Space>
          </div>
        </div>
        <List
          loading={loading}
          dataSource={dataSource}
          renderItem={(item) => {
            return (
              <List.Item
                key={item[`${rowKey}`] || item?._id}
                extra={
                  <Space>
                    {popConfirm({
                      children: (
                        <Button
                          icon={<RedoOutlined />}
                          title="Restore"
                          onClick={() => setCheckedSubProduct(item._id)}
                        />
                      ),
                      item,
                      type: "restore",
                    })}
                    {popConfirm({
                      children: (
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          title="Delete"
                          onClick={() => setCheckedSubProduct(item._id)}
                        />
                      ),
                      item,
                      type: "delete",
                    })}
                  </Space>
                }
              >
                {renderItem?.(item)}
              </List.Item>
            );
          }}
          pagination={pagination}
        />
      </div>

      <ModalConfirm
        isOpen={openModalConfirm}
        onClose={() => {
          setOpenModalConfirm(false);
          setTypeAction(undefined);
        }}
        action={typeAction?.action || "delete"}
        title={`${
          typeAction?.action === "restore" ? "Restore" : "Delete"
        } ${tabName}`}
        type={typeAction?.type || "selected"}
        selectedKeys={selectedKeys}
        onFetch={() => {
          onFetch?.();
          setSelectedKeys([]);
        }}
        messageApi={messageApi}
        tabName={tabName}
        api_all={api_all}
        api_bulk={api_bulk}
      />
    </>
  );
};

const ModalConfirm = ({
  isOpen,
  onClose,
  action,
  title,
  type,
  selectedKeys,
  onFetch,
  messageApi,
  tabName,
  api_bulk,
  api_all,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  title: string;
  type: "all" | "selected";
  selectedKeys: string[];
  onFetch: () => void;
  messageApi?: MessageInstance;
  tabName: string;
  api_bulk: string;
  api_all: string;
}) => {
  const [changing, setChanging] = useState(false);
  const [checkedBulkSubProduct, setCheckedBulkSubProduct] = useState(true);

  const handleBulkAction = async (action: string) => {
    try {
      setChanging(true);

      const api = `${api_bulk}?action=${action}`;
      console.log(api);
      const response: any = await handleAPI(
        api,
        { ids: selectedKeys, checkedSubProduct: checkedBulkSubProduct },
        "patch"
      );
      onFetch();
      onClose();
      if (tabName === "product") {
        setCheckedBulkSubProduct(false);
      }
      messageApi?.success(response.message || "Bulk action successful");
    } catch (error: any) {
      console.log(error);
      messageApi?.error(error.message || "An error occurred");
    } finally {
      setChanging(false);
    }
  };

  const handleAll = async (action: string) => {
    try {
      setChanging(true);
      const api = `${api_all}?action=${action}`;
      const response: any = await handleAPI(
        api,
        { checkedBulkSubProduct },
        "patch"
      );
      onFetch();
      onClose();
      if (tabName === "product") {
        setCheckedBulkSubProduct(false);
      }
      messageApi?.success(response.message || "Bulk action successful");
    } catch (error: any) {
      console.log(error);
      messageApi?.error(error.message || "An error occurred");
    } finally {
      setChanging(false);
    }
  };

  return (
    <Modal
      title={
        <p className="capitalize">{title || <span>Confirm Action</span>}</p>
      }
      open={isOpen}
      onOk={() =>
        type === "all" ? handleAll(action) : handleBulkAction(action)
      }
      onCancel={onClose}
      okButtonProps={{ loading: changing }}
      cancelButtonProps={{ disabled: changing }}
      maskClosable={!changing}
    >
      <div className="flex flex-col gap-2">
        <div>
          {action === "restore"
            ? `Are you sure you want to restore  ${
                type === "all" ? "All" : `${selectedKeys.length} selected`
              } ${tabName}s?`
            : `Are you sure you want to delete ${
                type === "all" ? "All" : `${selectedKeys.length} selected`
              } ${tabName}s forever?`}
        </div>

        {tabName === "product" ? (
          <div className="flex items-center gap-2 my-2">
            <Checkbox
              checked={checkedBulkSubProduct}
              onChange={(e) => setCheckedBulkSubProduct?.(e.target.checked)}
              id={`bulk-sub-product`}
            />
            <label htmlFor={`bulk-sub-product`}>
              {action === "restore" ? "Restore" : "Delete"} all sub products
            </label>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default ListDataTrash;
