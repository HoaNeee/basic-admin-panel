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
import type { ProductModel } from "../../models/productModel";

const { Search } = Input;
const { Title, Text } = Typography;

interface IProductPayload extends ProductModel {
  vector_id: string;
  similarity_score?: number;
}

const ProductTab = ({ onFetchStats }: { onFetchStats: () => void }) => {
  const [products, setProducts] = useState<IProductPayload[]>([]);
  const [nextPageOffset, setNextPageOffset] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "view">("add");
  const [viewingProduct, setViewingProduct] = useState<IProductPayload | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();

  const limit = 10;

  const getEmbedProduct = async (reset = false) => {
    setLoading(true);
    try {
      const offset = reset ? "" : nextPageOffset || "";
      const response = await handleAPI(
        `/products/embed?next_page_offset=${offset}&limit=${limit}`
      );
      const payloads = response.data.products;

      if (reset) {
        setProducts(payloads);
      } else {
        setProducts((prev) => [...prev, ...payloads]);
      }

      setNextPageOffset(response.data.next_page_offset);
    } catch (error) {
      console.error("Error fetching embed product:", error);
      messageApi.error("Lỗi khi tải danh sách sản phẩm embedding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getEmbedProduct();
    };
    fetchData();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSyncEmbedding = async (id: string) => {
    try {
      setLoading(true);
      const response: any = await handleAPI(
        `/products/embed/sync/${id}?collection_name=products`,
        {},
        "patch"
      );
      messageApi.success(response.message || "Sync embedding thành công!");
      const data = response.data;
      const index = products.findIndex((item) => item.vector_id === id);
      if (index !== -1) {
        const updatedProducts = [...products];
        updatedProducts[index] = { ...updatedProducts[index], ...data };
        setProducts(updatedProducts);
        if (viewingProduct && viewingProduct.vector_id === id) {
          setViewingProduct({ ...viewingProduct, ...data });
        }
      }
    } catch (error) {
      console.error("Error syncing embedding:", error);
      messageApi.error("Lỗi khi sync embedding");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmbedding = async (id: string) => {
    try {
      const response: any = await handleAPI(
        `/products/embed/delete/${id}?collection_name=products`,
        {},
        "delete"
      );
      messageApi.success(response.message || "Xóa embedding thành công!");
      await getEmbedProduct(true);
      onFetchStats();
    } catch (error) {
      console.error("Error deleting embedding:", error);
      messageApi.error("Lỗi khi xóa embedding");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const payload = { vector_ids: selectedRowKeys };
      await handleAPI(
        "/products/embed/bulk-delete?collection_name=products",
        payload,
        "delete"
      );
      messageApi.success(`Xóa ${selectedRowKeys.length} embedding thành công!`);
      setSelectedRowKeys([]);
      await getEmbedProduct(true);
      onFetchStats();
    } catch (error) {
      console.error("Error bulk deleting embeddings:", error);
      messageApi.error("Lỗi khi xóa hàng loạt");
    }
  };

  const openModal = (type: "add" | "view", product?: IProductPayload) => {
    setModalType(type);
    setIsModalVisible(true);
    if (type === "view" && product) {
      setViewingProduct(product);
    }
  };

  const formatPrice = (
    price: number | null,
    rangePrice?: { min: number; max: number }
  ) => {
    if (price) {
      return `${price?.toLocaleString()} VNĐ`;
    }
    if (rangePrice) {
      return `${rangePrice?.min?.toLocaleString()} - ${rangePrice?.max?.toLocaleString()} VNĐ`;
    }
    return "N/A";
  };

  const handleSelectProduct = (vector_id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, vector_id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== vector_id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(products.map((product) => product.vector_id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const renderItems = (item: IProductPayload) => {
    return (
      <List.Item
        key={item.vector_id}
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          marginBottom: 12,
          padding: "16px",
          backgroundColor: selectedRowKeys.includes(item.vector_id)
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
                onClick={() => handleSyncEmbedding(item.vector_id)}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa embedding này?"
                onConfirm={() => handleDeleteEmbedding(item.vector_id)}
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
              src={item.thumbnail}
              style={{ objectFit: "cover", borderRadius: 6 }}
              preview={false}
            />
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <Checkbox
            checked={selectedRowKeys.includes(item.vector_id)}
            onChange={(e) =>
              handleSelectProduct(item.vector_id, e.target.checked)
            }
          />
          <List.Item.Meta
            avatar={
              <Avatar
                size={48}
                src={item.thumbnail}
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
                  <Text type="secondary">
                    Vector ID:
                    <Tooltip title={item.vector_id}>
                      <Text code style={{ fontSize: "11px", marginLeft: 4 }}>
                        {item.vector_id.substring(0, 16)}...
                      </Text>
                    </Tooltip>
                  </Text>
                  <div>
                    {item.categories?.slice(0, 3).map((category, index) => (
                      <Tag
                        key={index}
                        color="blue"
                        style={{ margin: "2px 2px 2px 0" }}
                      >
                        {category.substring(0, 12)}...
                      </Tag>
                    ))}
                    {item.categories && item.categories.length > 3 && (
                      <Tag color="default">+{item.categories.length - 3}</Tag>
                    )}
                  </div>
                  <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                    {formatPrice(
                      typeof item.price === "number" ? item.price : null,
                      item.rangePrice
                    )}
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
      {contextHolder}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm theo tên, SKU, mô tả..."
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
                onClick={() => getEmbedProduct(true)}
                loading={loading}
              >
                Làm mới
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} sản phẩm?`}
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
          {products.length > 0 && (
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
                    selectedRowKeys.length < products.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={
                    products.length > 0 &&
                    selectedRowKeys.length === products.length
                  }
                >
                  Chọn tất cả ({products.length})
                </Checkbox>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Divider type="vertical" />
                    <Text>Đã chọn {selectedRowKeys.length} sản phẩm</Text>
                  </>
                )}
              </Space>
            </div>
          )}

          <List
            itemLayout="vertical"
            size="small"
            dataSource={products}
            renderItem={(item) => renderItems(item)}
          />

          {nextPageOffset && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button
                size="large"
                onClick={() => getEmbedProduct()}
                loading={loading}
                style={{
                  borderRadius: 20,
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                Tải thêm sản phẩm
              </Button>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Title level={4} type="secondary">
                Không có dữ liệu
              </Title>
              <Text type="secondary">
                {searchValue
                  ? "Không tìm thấy sản phẩm phù hợp"
                  : "Chưa có sản phẩm nào"}
              </Text>
            </div>
          )}
        </Spin>
      </Card>

      <ModalDetail
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        modalType={modalType}
        viewingProduct={viewingProduct || ({} as IProductPayload)}
        onSync={() => {
          if (viewingProduct) {
            handleSyncEmbedding(viewingProduct.vector_id);
          }
        }}
        loading={loading}
        formatPrice={formatPrice}
      />
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: "add" | "view";
  viewingProduct: IProductPayload;
  onSync: () => void;
  loading: boolean;
  formatPrice: (
    value: number | null,
    range?: { min: number; max: number }
  ) => string;
}

const ModalDetail = (props: ModalProps) => {
  const {
    isOpen,
    onClose,
    modalType,
    viewingProduct,
    onSync,
    loading,
    formatPrice,
  } = props;

  useEffect(() => {
    if (modalType === "add") {
      //do something...
    }
  }, [modalType, viewingProduct]);

  return (
    <Modal
      title={modalType === "add" ? "Thêm Product Mới" : "Chi tiết Product"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={modalType === "view" ? 800 : 600}
    >
      {modalType === "view" && viewingProduct ? (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Image
                width="100%"
                height={200}
                src={viewingProduct.thumbnail}
                style={{ objectFit: "cover", borderRadius: 6 }}
              />
            </Col>
            <Col span={16}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Tên sản phẩm:</Text>
                  <br />
                  <Text style={{ fontSize: "16px" }}>
                    {viewingProduct.title}
                  </Text>
                </div>

                <div>
                  <Text strong>SKU:</Text>
                  <br />
                  <Text>{viewingProduct.SKU}</Text>
                </div>

                <div>
                  <Text strong>Vector ID:</Text>
                  <br />
                  <Text code style={{ fontSize: "12px" }}>
                    {viewingProduct.vector_id}
                  </Text>
                </div>

                <div>
                  <Text strong>Giá:</Text>
                  <br />
                  <Text
                    style={{
                      color: "#1890ff",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {formatPrice(
                      typeof viewingProduct.price === "number"
                        ? viewingProduct.price
                        : null,
                      viewingProduct.rangePrice
                    )}
                  </Text>
                </div>

                {viewingProduct.similarity_score && (
                  <div>
                    <Text strong>Similarity Score:</Text>
                    <br />
                    <Badge
                      count={`${(viewingProduct.similarity_score * 100).toFixed(
                        1
                      )}%`}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  </div>
                )}
              </Space>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div>
                <Text strong>Mô tả ngắn:</Text>
                <br />
                <Text>
                  {viewingProduct.shortDescription || "Chưa có mô tả"}
                </Text>
              </div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div>
                <Text strong>Danh mục:</Text>
                <br />
                <div style={{ marginTop: 8 }}>
                  {viewingProduct.categories?.map((category, index) => (
                    <Tag
                      key={index}
                      color="blue"
                      style={{ margin: "2px 4px 2px 0" }}
                    >
                      {category}
                    </Tag>
                  )) || <Text type="secondary">Chưa có danh mục</Text>}
                </div>
              </div>
            </Col>
          </Row>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={onClose}>Đóng</Button>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={onSync}
                loading={loading}
              >
                Sync Embedding
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div>Add</div>
      )}
    </Modal>
  );
};

export default ProductTab;
