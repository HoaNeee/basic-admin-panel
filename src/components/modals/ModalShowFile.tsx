import { Button, Image, Modal, Typography, Space } from "antd";
import { FiImage, FiDownload, FiMaximize } from "react-icons/fi";
import type { ReviewModel } from "../../models/reviewModel";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  review?: ReviewModel;
}

const ModalShowFile = (props: Props) => {
  const { isOpen, onClose, review } = props;

  const hasImages = review?.images && review.images.length > 0;
  const imageCount = review?.images?.length || 0;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiImage className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <Title level={4} className="mb-0">
              Review Images
            </Title>
            <Text type="secondary" className="text-sm">
              {imageCount} {imageCount === 1 ? "image" : "images"} uploaded by
              customer
            </Text>
          </div>
        </div>
      }
      width="90%"
      style={{ maxWidth: "1200px" }}
      centered
      className="image-modal"
      styles={{
        header: {
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          borderRadius: "8px 8px 0 0",
        },
        body: {
          padding: 0,
          maxHeight: "70vh",
          overflow: "hidden",
        },
      }}
    >
      <div className="bg-white">
        {hasImages ? (
          <>
            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: "calc(70vh - 120px)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {review.images.map((item, index) => (
                  <div key={item} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
                      <Image
                        src={item}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        preview={{
                          mask: (
                            <div className="flex items-center justify-center gap-2 text-white">
                              <FiMaximize className="w-4 h-4" />
                              <span className="text-sm">View Full Size</span>
                            </div>
                          ),
                        }}
                      />
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Space size="small">
                        <Button
                          type="primary"
                          size="small"
                          icon={<FiDownload className="w-3 h-3" />}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = item;
                            link.download = `review-image-${index + 1}`;
                            link.click();
                          }}
                        />
                      </Space>
                    </div>

                    {/* Image Index */}
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {index + 1} / {imageCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiImage className="w-8 h-8 text-gray-400" />
            </div>
            <Title level={4} type="secondary" className="mb-2">
              No Images Available
            </Title>
            <Text type="secondary">
              This review doesn't contain any uploaded images.
            </Text>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {hasImages
              ? "Click on any image to view in full size"
              : "No images to display"}
          </div>
          <Space>
            <Button onClick={onClose} type="default">
              Close
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ModalShowFile;
