/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Modal,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Badge,
  Image,
  Spin,
  Checkbox,
  Avatar,
  Divider,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  SyncOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { handleAPI } from "../../apis/request";
import type { SubProductModel } from "../../models/productModel";

const { Search } = Input;
const { Title, Text } = Typography;

interface ISubProductPayload extends SubProductModel {
  title: string;
  shortDescription: string;
  categories: string[];
  slug: string;
  vector_id?: string;
  similarity_score?: number;
}

const SubProductTab = ({ onFetchStats }: { onFetchStats: () => void }) => {
  const [subProducts, setSubProducts] = useState<ISubProductPayload[]>([]);
  const [nextPageOffset, setNextPageOffset] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "view">("add");
  const [viewingSubProduct, setViewingSubProduct] =
    useState<ISubProductPayload | null>(null);

  const limit = 10;

  useEffect(() => {
    const fetchSubProducts = async () => {
      await getSubProducts();
    };
    fetchSubProducts();
  }, []);

  const getSubProducts = async (reset = false) => {
    setLoading(true);
    try {
      const offset = reset ? "" : nextPageOffset || "";

      const response = await handleAPI(
        `/products/sub-products/embed?next_page_offset=${offset}&limit=${limit}`
      );
      const payloads = response.data.subProducts;

      if (reset) {
        setSubProducts(payloads);
      } else {
        setSubProducts((prev) => [...prev, ...payloads]);
      }

      setNextPageOffset(response.data.next_page_offset);
    } catch (error) {
      console.error("Error fetching sub products:", error);
      message.error("Lỗi khi tải danh sách sub products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSyncSubProduct = async (id: string) => {
    try {
      setLoading(true);
      const response: any = await handleAPI(
        `/products/embed/sync/${id}?collection_name=sub-products`,
        {},
        "patch"
      );
      message.success(response.message || "Sync sub product thành công!");
      const data = response.data;
      const index = subProducts.findIndex((item) => item._id === id);
      if (index !== -1) {
        const updatedSubProducts = [...subProducts];
        updatedSubProducts[index] = { ...updatedSubProducts[index], ...data };
        setSubProducts(updatedSubProducts);
        if (viewingSubProduct && viewingSubProduct._id === id) {
          setViewingSubProduct(updatedSubProducts[index]);
        }
      }
    } catch (error) {
      console.error("Error syncing sub product:", error);
      message.error("Lỗi khi sync sub product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubProduct = async (id: string) => {
    try {
      await handleAPI(
        `/products/embed/delete/${id}?collection_name=sub-products`,
        {},
        "delete"
      );
      message.success("Xóa sub product thành công!");
      await getSubProducts(true);
    } catch (error) {
      console.error("Error deleting sub product:", error);
      message.error("Lỗi khi xóa sub product");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const payload = { vector_ids: selectedRowKeys };
      await handleAPI(
        "/products/embed/bulk-delete?collection_name=sub-products",
        payload,
        "delete"
      );
      message.success(`Xóa ${selectedRowKeys.length} sub product thành công!`);
      setSelectedRowKeys([]);
      await getSubProducts(true);
      onFetchStats();
    } catch (error) {
      console.error("Error bulk deleting sub products:", error);
      message.error("Lỗi khi xóa hàng loạt");
    }
  };

  const openModal = (type: "add" | "view", subProduct?: ISubProductPayload) => {
    setModalType(type);
    setIsModalVisible(true);
    if (type === "view" && subProduct) {
      setViewingSubProduct(subProduct);
    }
  };

  const handleSelectSubProduct = (vector_id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, vector_id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== vector_id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(
        subProducts.map((subProduct) => subProduct.vector_id || "")
      );
    } else {
      setSelectedRowKeys([]);
    }
  };

  const renderItems = (item: ISubProductPayload) => {
    return (
      <List.Item
        key={item._id}
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          marginBottom: 12,
          padding: "16px",
          backgroundColor: selectedRowKeys.includes(item._id || "")
            ? "#e6f7ff"
            : "white",
          transition: "all 0.3s ease",
        }}
        actions={[
          <Space key="actions" size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openModal("view", item)}
              />
            </Tooltip>
            <Tooltip title="Sync">
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined />}
                onClick={() => handleSyncSubProduct(item.vector_id || "")}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa sub product này?"
                onConfirm={() => handleDeleteSubProduct(item._id || "")}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>,
        ]}
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              width={100}
              height={100}
              src={item?.thumbnail as string}
              style={{ objectFit: "cover", borderRadius: 6 }}
              preview={false}
            />
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <Checkbox
            checked={selectedRowKeys.includes(item.vector_id || "")}
            onChange={(e) =>
              handleSelectSubProduct(item.vector_id || "", e.target.checked)
            }
          />
          <List.Item.Meta
            avatar={
              <Avatar
                size={48}
                src={item.thumbnail as string}
                style={{ backgroundColor: "#ddd" }}
              >
                {item.title?.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={
              <div>
                <Space align="center">
                  <Text strong style={{ fontSize: "16px" }}>
                    {item.title}
                  </Text>
                  {item.similarity_score && (
                    <Badge
                      count={`${(item.similarity_score * 100).toFixed(1)}%`}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  )}
                </Space>
              </div>
            }
            description={
              <div>
                <Space direction="vertical" size="small">
                  <Text type="secondary">SKU: {item.SKU}</Text>
                  <Text type="secondary">Product ID: {item.product_id}</Text>
                  <Text type="secondary">
                    Options: {item.options as string}
                  </Text>
                  {item.vector_id && (
                    <Text type="secondary">
                      Vector ID:
                      <Tooltip title={item.vector_id}>
                        <Text code style={{ fontSize: "11px", marginLeft: 4 }}>
                          {item.vector_id.substring(0, 16)}...
                        </Text>
                      </Tooltip>
                    </Text>
                  )}
                  <div>
                    {item.categories?.slice(0, 3).map((category, index) => (
                      <Tag
                        key={index}
                        color="green"
                        style={{ margin: "2px 2px 2px 0" }}
                      >
                        {category.substring(0, 12)}...
                      </Tag>
                    ))}
                    {item.categories && item.categories.length > 3 && (
                      <Tag color="default">+{item.categories.length - 3}</Tag>
                    )}
                  </div>
                  <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                    {Number(item?.price).toLocaleString()} VNĐ
                  </Text>
                </Space>
              </div>
            }
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" ellipsis>
            {item.shortDescription}
          </Text>
        </div>
      </List.Item>
    );
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm theo tên, SKU, options..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button
                icon={<SyncOutlined />}
                onClick={() => getSubProducts(true)}
                loading={loading}
              >
                Làm mới
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} sub product?`}
                  onConfirm={handleBulkDelete}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa đã chọn ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Spin spinning={loading}>
          {subProducts.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: "16px",
                backgroundColor: "#fafafa",
                borderRadius: 6,
              }}
            >
              <Space align="center">
                <Checkbox
                  indeterminate={
                    selectedRowKeys.length > 0 &&
                    selectedRowKeys.length < subProducts.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    subProducts.length > 0 &&
                    selectedRowKeys.length === subProducts.length
                  }
                >
                  Chọn tất cả ({subProducts.length})
                </Checkbox>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Divider type="vertical" />
                    <Text>Đã chọn {selectedRowKeys.length} sub product</Text>
                  </>
                )}
              </Space>
            </div>
          )}

          <List
            itemLayout="vertical"
            size="small"
            dataSource={subProducts}
            renderItem={(item) => renderItems(item)}
          />

          {nextPageOffset && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button
                size="large"
                onClick={() => getSubProducts()}
                loading={loading}
                style={{
                  borderRadius: 20,
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                Tải thêm sub product
              </Button>
            </div>
          )}

          {!loading && subProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Title level={4} type="secondary">
                Không có dữ liệu
              </Title>
              <Text type="secondary">
                {searchValue
                  ? "Không tìm thấy sub product phù hợp"
                  : "Chưa có sub product nào"}
              </Text>
            </div>
          )}
        </Spin>
      </Card>

      <ModalDetail
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSync={() => handleSyncSubProduct(viewingSubProduct?.vector_id || "")}
        viewingSubProduct={viewingSubProduct}
        modalType={modalType}
        loading={loading}
      />
    </div>
  );
};

interface ModalDetailProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  viewingSubProduct: ISubProductPayload | null;
  modalType: "add" | "view";
  loading: boolean;
}

const ModalDetail = (props: ModalDetailProps) => {
  const { isOpen, onClose, viewingSubProduct, modalType, onSync, loading } =
    props;
  return (
    <Modal
      title={
        modalType === "add" ? "Thêm Sub Product Mới" : "Chi tiết Sub Product"
      }
      open={isOpen}
      onCancel={onClose}
      footer={
        modalType === "view" && viewingSubProduct ? (
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={onClose}>Đóng</Button>
              <Button
                type="primary"
                onClick={onSync}
                loading={loading}
                icon={<SyncOutlined />}
              >
                Sync Embedding
              </Button>
            </Space>
          </div>
        ) : null
      }
      width={700}
    >
      {modalType === "view" && viewingSubProduct ? (
        <div style={{ padding: "16px 0" }}>
          <Row gutter={24}>
            <Col span={8}>
              {viewingSubProduct.thumbnail && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <img
                    src={viewingSubProduct.thumbnail as string}
                    alt={viewingSubProduct.title}
                    style={{
                      width: "100%",
                      maxWidth: 200,
                      borderRadius: 8,
                      border: "1px solid #d9d9d9",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/200x200?text=No+Image";
                    }}
                  />
                </div>
              )}
            </Col>
            <Col span={16}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 18 }}>
                  {viewingSubProduct.title}
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text strong>SKU:</Text>
                    <br />
                    <Text>{viewingSubProduct.SKU}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>Giá:</Text>
                    <br />
                    <Text
                      style={{
                        color: "#f5222d",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {viewingSubProduct.price?.toLocaleString()} VND
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>Product ID:</Text>
                    <br />
                    <Text code>{viewingSubProduct.product_id}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>Options:</Text>
                    <br />
                    <Text>{viewingSubProduct.options as string}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <Text strong>Mô tả ngắn:</Text>
                    <br />
                    <Text>
                      {viewingSubProduct.shortDescription || "Không có mô tả"}
                    </Text>
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <Text strong>Danh mục:</Text>
                    <br />
                    {viewingSubProduct.categories &&
                    viewingSubProduct.categories.length > 0 ? (
                      <div style={{ marginTop: 4 }}>
                        {viewingSubProduct.categories.map(
                          (cat: string | { name: string }, index: number) => (
                            <Tag
                              key={index}
                              color="blue"
                              style={{ marginBottom: 4 }}
                            >
                              {typeof cat === "string" ? cat : cat.name}
                            </Tag>
                          )
                        )}
                      </div>
                    ) : (
                      <Text type="secondary">Chưa có danh mục</Text>
                    )}
                  </div>
                </Col>
                <Col span={24}>
                  <div>
                    <Text strong>ID:</Text>
                    <br />
                    <Text code>{viewingSubProduct._id}</Text>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      ) : (
        <div>Add</div>
      )}
    </Modal>
  );
};

export default SubProductTab;
