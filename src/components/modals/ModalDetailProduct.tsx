import { Modal, Descriptions, Image, Tag, Typography } from "antd";
import type { ProductModel } from "../../models/productModel";

const { Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: ProductModel | null;
}

const ModalDetailProduct = (props: Props) => {
  const { isOpen, onClose, product } = props;

  const handleClose = () => {
    onClose();
  };

  const formatPrice = (price?: number | string) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(price));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      title="Product Details"
      width={800}
      centered
    >
      {product && (
        <div
          className="space-y-4"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "80vh",
            WebkitScrollSnapType: "y mandatory",
            scrollbarWidth: "thin",
            scrollbarColor: "#ddd transparent",
          }}
        >
          {product.thumbnail && (
            <div className="text-center mb-4">
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={200}
                height={200}
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
          )}

          <Descriptions
            title="Basic Information"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="ID" span={2}>
              <Text copyable>{product._id}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Title" span={2}>
              <Text strong>{product.title}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="SKU">
              {product.SKU || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Slug">
              <Text copyable>{product.slug}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Product Type" span={2}>
              <Tag color={product.productType === "simple" ? "blue" : "green"}>
                {product.productType.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            {product.productType === "variations" && (
              <Descriptions.Item label="Sub Products" span={2}>
                {product.count_sub_product || 0} items
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Short Description" span={2}>
              {product.shortDescription || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Content" span={2}>
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
                dangerouslySetInnerHTML={{
                  __html: product.content || "No content available",
                }}
              />
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Pricing & Stock"
            bordered
            column={2}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Price">
              {formatPrice(product.price)}
            </Descriptions.Item>

            <Descriptions.Item label="Cost">
              {formatPrice(product.cost)}
            </Descriptions.Item>

            <Descriptions.Item label="Stock">
              <Tag color={Number(product.stock) > 0 ? "green" : "red"}>
                {product.stock || 0}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Supplier">
              <Text copyable>{product.supplierName}</Text>
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Categories"
            bordered
            column={1}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Categories">
              <div className="flex flex-wrap gap-1">
                {product.categories_info &&
                product.categories_info.length > 0 ? (
                  product.categories_info.map((category, index) => (
                    <Tag key={index} color="blue">
                      {category.title}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No categories</Text>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>

          {product.images && product.images.length > 0 && (
            <Descriptions
              title="Image Gallery"
              bordered
              column={1}
              size="small"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="Images">
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`Product image ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  ))}
                </div>
              </Descriptions.Item>
            </Descriptions>
          )}

          <Descriptions
            title="System Information"
            bordered
            column={2}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="Status">
              <Tag color={product.status === "inactive" ? "red" : "green"}>
                {product.status === "inactive" ? "INACTIVE" : "ACTIVE"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Deleted">
              <Tag color={product.deleted ? "red" : "green"}>
                {product.deleted ? "DELETED" : "ACTIVE"}
              </Tag>
            </Descriptions.Item>

            {product.deleted && (
              <Descriptions.Item label="Deleted At">
                {formatDate(product.deletedAt)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">
              {formatDate(product.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Updated At" span={2}>
              {formatDate(product.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};

export default ModalDetailProduct;
