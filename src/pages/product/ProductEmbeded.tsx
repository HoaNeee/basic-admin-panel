/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  Modal,
  List,
  message,
  Input,
  Progress,
  Checkbox,
  Select,
} from "antd";
import {
  SyncOutlined,
  DatabaseOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  ShopOutlined,
  TagsOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { handleAPI } from "../../apis/request";
import ProductTab from "./ProductTab";
import SubProductTab from "./SubProductTab";
import type { MessageInstance } from "antd/es/message/interface";

const { Title, Text } = Typography;

interface EmbeddingStats {
  total_vectors: number;
  total_vectors_sub_products: number;
  indexed_products?: number;
  pending_embeddings: number;
  pending_sync: number;
  last_sync: string;
}

interface IProductNotEmbedded {
  _id: string;
  title: string;
  thumbnail: string;
  SKU: string;
  type: "update" | "delete";
}

const ProductEmbeded = () => {
  const [embeddingStats, setEmbeddingStats] = useState<EmbeddingStats>({
    total_vectors: 0,
    total_vectors_sub_products: 0,
    pending_embeddings: 0,
    pending_sync: 0,
    last_sync: new Date().toISOString(),
  });
  const [current_total_vector, setCurrent_total_vector] = useState(0);
  const [current_product, setCurrent_product] =
    useState<IProductNotEmbedded | null>(null);
  const [productsNotEmbedded, setProductsNotEmbedded] = useState<
    IProductNotEmbedded[]
  >([]);
  const [productNeedSync, setProductNeedSync] = useState<IProductNotEmbedded[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [openModalAddProduct, setOpenModalAddProduct] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [openModalSetting, setOpenModalSetting] = useState(false);
  const [payloadProduct, setPayloadProduct] = useState<Record<string, any>>();
  const [payloadSubProduct, setPayloadSubProduct] =
    useState<Record<string, any>>();
  const [totalProduct, setTotalProduct] = useState(0);

  const isCancel = useRef(false);
  const error = useRef<string>("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getEmbeddingStats(), getProductNotEmbedded()]);
      } catch (error) {
        console.log(error);
        messageApi.error("Error fetching initial data");
      }
    };
    fetchData();
  }, []);

  const getProductNotEmbedded = async () => {
    try {
      setLoading(true);
      const response = await handleAPI("/products/embed/not-embedded");
      const product_not_embeded = response.data.product_not_embedded;
      const product_need_sync = response.data.product_need_sync;
      setProductsNotEmbedded(product_not_embeded);
      setProductNeedSync(product_need_sync);
      setTotalProduct(product_not_embeded.length + product_need_sync.length);
    } catch (error) {
      console.error("Error fetching products not embedded:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmbeddingStats = async () => {
    try {
      setLoading(true);
      const response = await handleAPI("/products/embed/statistics");
      setEmbeddingStats(response.data);
      const payload_product = response.data.payload_schema_product;
      const payload_sub_product = response.data.payload_schema_sub_product;
      setPayloadProduct(payload_product);
      setPayloadSubProduct(payload_sub_product);
    } catch (error) {
      console.error("Error fetching embedding stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllEmbeddings = async (
    totalProduct: number,
    products: any[]
  ) => {
    try {
      setSyncing(true);

      for (let i = 0; i < totalProduct; i++) {
        if (isCancel.current || error.current) {
          break;
        }
        await handleSyncEmbedding(
          totalProduct,
          products[i],
          isCancel.current,
          error.current
        );
      }
      await handleAPI(
        "/products/embed/sync/sync-time",
        {
          type_sync: "product",
        },
        "post"
      );
      await getEmbeddingStats();
      await getProductNotEmbedded();
      setCurrent_total_vector(0);
      setCurrent_product(null);
      if (isCancel.current) {
        messageApi.warning("Embedding sync was cancelled.");
      } else {
        messageApi.success("Syncing embeddings completed successfully");
      }
    } catch (error: any) {
      console.error("Error syncing embeddings:", error);
      messageApi.error(error.message || (error as string));
      error.current = error.message || (error as string);
    } finally {
      setSyncing(false);
      isCancel.current = false;
    }
  };

  const handleSyncEmbedding = async (
    totalProduct: number,
    product: IProductNotEmbedded,
    isCancel: boolean,
    error: string
  ) => {
    try {
      if (isCancel || current_total_vector >= totalProduct || error) {
        return;
      }

      await handleAPI(
        `/products/embed/${product._id}?type=${product.type}`,
        {},
        "post"
      );
      setCurrent_total_vector((prev) => prev + 1);
      setCurrent_product(product);
    } catch (error: any) {
      throw error.message || (error as string);
    }
  };

  const handleSyncAgainAllEmbeddings = async () => {
    try {
      setSyncing(true);
      const res = await handleAPI("/products/get-all-product-ids");
      const products = res.data;
      setTotalProduct(products.length);
      await handleSyncAllEmbeddings(products.length, products);
    } catch (error) {
      console.log(error);
      messageApi.error("Error syncing embeddings again");
    } finally {
      setSyncing(false);
      isCancel.current = false;
    }
  };

  const tabItems = [
    {
      key: "products",
      label: (
        <span>
          <ShopOutlined />
          Products
        </span>
      ),
      children: (
        <ProductTab
          onFetchStats={async () => {
            await Promise.all([getEmbeddingStats(), getProductNotEmbedded()]);
          }}
        />
      ),
    },
    {
      key: "subProducts",
      label: (
        <span>
          <TagsOutlined />
          Sub Products
        </span>
      ),
      children: <SubProductTab onFetchStats={getEmbeddingStats} />,
    },
  ];

  const renderProgress = (totalProduct: number) => {
    return (
      <div>
        <div className="mt-2 flex items-center gap-2">
          <Progress
            percent={Number(
              ((current_total_vector * 100) / totalProduct).toFixed(0)
            )}
            status={
              error.current
                ? "exception"
                : current_total_vector === totalProduct && totalProduct > 0
                ? "success"
                : "active"
            }
          />
          <Button
            onClick={() => {
              isCancel.current = true;
            }}
            size="small"
          >
            Cancel
          </Button>
        </div>
        {error.current ? (
          <p className="text-red-500">{error.current}</p>
        ) : (
          current_product && <p>{current_product.title}</p>
        )}
      </div>
    );
  };

  return (
    <div>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row align="middle" justify="space-between">
              <Col>
                <Title
                  level={3}
                  style={{ margin: 0, display: "flex", alignItems: "center" }}
                >
                  <DatabaseOutlined
                    style={{ marginRight: 8, color: "#1890ff" }}
                  />
                  Embedding Products
                </Title>
                <Text type="secondary">
                  Quản lý vector embeddings cho tìm kiếm sản phẩm với Qdrant
                </Text>
              </Col>
              <Col>
                <Space wrap>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={handleSyncAgainAllEmbeddings}
                    loading={syncing}
                  >
                    Đồng bộ lại tất cả
                  </Button>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={async () => {
                      const totalProduct =
                        productNeedSync.length + productsNotEmbedded.length;

                      const data = [...productNeedSync, ...productsNotEmbedded];
                      await handleSyncAllEmbeddings(totalProduct, data);
                    }}
                    loading={syncing}
                  >
                    Đồng bộ dữ liệu mới
                  </Button>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setOpenModalSetting(true)}
                  >
                    Cài đặt
                  </Button>
                </Space>
              </Col>
            </Row>
            {syncing && renderProgress(totalProduct)}
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full">
                <Statistic
                  loading={loading}
                  title="Tổng Vectors"
                  value={embeddingStats.total_vectors}
                  valueRender={(value) => {
                    return (
                      <div className="text-base space-y-1 my-1 font-medium">
                        <p>Products: {value}</p>
                        <p>
                          Sub Products:{" "}
                          {embeddingStats.total_vectors_sub_products}
                        </p>
                      </div>
                    );
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full">
                <Statistic
                  loading={loading}
                  title="Cần Sync"
                  value={embeddingStats.pending_sync}
                  prefix={<SyncOutlined style={{ color: "orange" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full">
                <Statistic
                  loading={loading}
                  title="Chờ Embedding"
                  value={embeddingStats.pending_embeddings}
                  prefix={<SyncOutlined style={{ color: "#1890ff" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="h-full">
                <Statistic
                  loading={loading}
                  title="Lần Sync cuối"
                  value={new Date(embeddingStats.last_sync).toLocaleString()}
                  prefix={<InfoCircleOutlined style={{ color: "#722ed1" }} />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Card>
            <Tabs
              defaultActiveKey="products"
              size="large"
              tabPosition="top"
              items={tabItems}
              tabBarExtraContent={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setOpenModalAddProduct(true)}
                >
                  Thêm mới
                </Button>
              }
            />
          </Card>
        </Col>
      </Row>

      <ModalAdd
        products={productsNotEmbedded}
        isOpen={openModalAddProduct}
        onClose={() => setOpenModalAddProduct(false)}
        messageApi={messageApi}
        onEmbed={async (id: string) => {
          setProductsNotEmbedded((prev) =>
            prev.filter((item) => item._id !== id)
          );
          await getEmbeddingStats();
        }}
      />
      <ModalSetting
        isOpen={openModalSetting}
        onClose={() => setOpenModalSetting(false)}
        payload_product={payloadProduct}
        payload_sub_product={payloadSubProduct}
        messageApi={messageApi}
        onFetch={async () => {
          await getEmbeddingStats();
        }}
      />
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageApi: MessageInstance;
  onEmbed: (product_id: string) => Promise<void>;
  products: IProductNotEmbedded[];
}

const ModalAdd = (props: ModalProps) => {
  const { isOpen, onClose, messageApi, onEmbed, products } = props;

  const [filteredProducts, setFilteredProducts] =
    useState<IProductNotEmbedded[]>(products);
  const [isEmbeding, setIsEmbeding] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setFilteredProducts(products);
  }, [isOpen]);

  const handleEmbedProduct = async (productId: string) => {
    try {
      setIsEmbeding(true);
      const api = `/products/embed/${productId}`;
      await handleAPI(api, {}, "post");
      messageApi.success("Embedding successful");
      setFilteredProducts((prev) =>
        prev.filter((item) => item._id !== productId)
      );
      await onEmbed(productId);
    } catch (error) {
      console.log(error);
      messageApi.error("Embedding failed. Please try again.");
    } finally {
      setIsEmbeding(false);
    }
  };

  return (
    <Modal
      title={
        <div className="space-y-1">
          <p className="">Embedding Product Mới</p>
          <p className="text-xs text-gray-500">({products.length}) sản phẩm</p>
        </div>
      }
      open={isOpen}
      onCancel={() => {
        setKeyword("");
        onClose();
      }}
      footer={null}
      width={600}
      height={"80%"}
      centered
      maskClosable={!isEmbeding}
    >
      <Input.Search
        placeholder="Search..."
        onChange={(e) => {
          const value = e.target.value.trim().toLowerCase();
          setKeyword(e.target.value);
          setFilteredProducts(
            products.filter(
              (item) =>
                item.title.toLowerCase().includes(value) ||
                item.SKU.toLowerCase().includes(value)
            )
          );
          if (!value) {
            setFilteredProducts(products);
          }
        }}
        value={keyword}
        allowClear
        size="large"
      />
      <div className="w-full max-h-[70vh] overflow-hidden overflow-y-auto">
        <div className="text-center px-6 my-2"></div>
        <List
          dataSource={filteredProducts}
          loading={isEmbeding}
          renderItem={(item) => (
            <List.Item
              extra={
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleEmbedProduct(item._id)}
                >
                  Embed
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-10 w-10 rounded bg-[#f1f1f1]"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.SKU}</p>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

const listDataType = [
  "keyword",
  "float",
  "bool",
  "datetime",
  "geo",
  "uuid",
  "text",
  "integer",
];

const ModalSetting = ({
  isOpen,
  onClose,
  payload_product,
  payload_sub_product,
  messageApi,
  onFetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  payload_product?: Record<string, any>;
  payload_sub_product?: Record<string, any>;
  messageApi: MessageInstance;
  onFetch: () => Promise<void>;
}) => {
  const [payloadProduct, setPayloadProduct] = useState<any[]>([]);
  const [payloadSubProduct, setPayloadSubProduct] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (payload_product) {
      setPayloadProduct(
        Object.keys(payload_product || {}).map((key) => {
          const checked =
            Object.keys(payload_product?.payload_schema || {}).includes(key) ||
            false;
          const data_type =
            payload_product?.payload_schema?.[key]?.data_type || "keyword";
          return {
            key,
            data_type: checked ? data_type : "keyword",
            checked: checked,
            product_type: "product",
          };
        })
      );
    }
    if (payload_sub_product) {
      setPayloadSubProduct(
        Object.keys(payload_product || {}).map((key) => {
          const checked =
            Object.keys(payload_product?.payload_schema || {}).includes(key) ||
            false;
          const data_type =
            payload_product?.payload_schema?.[key]?.data_type || "keyword";
          return {
            key,
            data_type: checked ? data_type : "keyword",
            checked: checked,
            product_type: "sub-product",
          };
        })
      );
    }
  }, [payload_product, payload_sub_product]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = [...payloadProduct, ...payloadSubProduct];
      const api = "/products/embed/change/indexed";
      await handleAPI(api, { payload }, "patch");
      messageApi?.success("Settings saved successfully");
      onFetch();
      onClose();
    } catch (error) {
      console.log(error);
      messageApi?.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPayload = (
    payload: Record<string, any>,
    data: any[],
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    return payload && Object.keys(payload).length > 0
      ? Object.keys(payload).map((key) => {
          if (key === "payload_schema") return null;
          return (
            <div key={key} className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  defaultChecked={Object.keys(
                    payload?.payload_schema || {}
                  ).includes(key)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const items = [...data];
                    const index = items.findIndex((item) => item.key === key);
                    if (index !== -1) {
                      items[index].checked = checked;
                    }
                    setData(items);
                  }}
                />
                <p>{key}</p>
              </div>
              <Select
                defaultValue={
                  Object.keys(payload?.payload_schema || {}).includes(key)
                    ? payload?.payload_schema[key].data_type
                    : "keyword"
                }
                onChange={(e) => {
                  const items = [...data];
                  const index = items.findIndex((item) => item.key === key);
                  if (index !== -1) {
                    items[index].data_type = e;
                  }
                  setData(items);
                }}
                placeholder="Select data type"
                options={listDataType.map((i) => ({
                  label: i,
                  value: i,
                }))}
                className="md:w-1/5 w-1/3"
              />
            </div>
          );
        })
      : null;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="">
          <p>Settings</p>
          <p className="text-xs font-normal text-neutral-400">
            (configure indexed fields for QdrantDB)
          </p>
        </div>
      }
      width={600}
      centered
      okText="Save"
      onOk={handleSave}
      okButtonProps={{ loading: isSaving }}
      maskClosable={!isSaving}
    >
      <div className="">
        <Tabs
          items={[
            {
              key: "product",
              label: "Products",
              children: (
                <div className="flex flex-col gap-2">
                  {renderPayload(
                    payload_product || {},
                    payloadProduct,
                    setPayloadProduct
                  )}
                </div>
              ),
            },
            {
              key: "sub-product",
              label: "Sub Products",
              children: (
                <div className="flex flex-col gap-2">
                  {renderPayload(
                    payload_sub_product || {},
                    payloadSubProduct,
                    setPayloadSubProduct
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default ProductEmbeded;
