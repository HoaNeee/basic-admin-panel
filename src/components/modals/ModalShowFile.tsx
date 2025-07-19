import { Button, Image, Modal } from "antd";
import type { ReviewModel } from "../../models/reviewModel";

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  review?: ReviewModel;
}

const ModalShowFile = (props: Props) => {
  const { isOpen, onClose, review } = props;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={false}
      title="Files"
      width={"82%"}
      centered
    >
      <div className="w-full min-h-100 overflow-hidden overflow-y-auto">
        {review && review.images && (
          <div className="flex flex-wrap w-full h-full overflow-hidden overflow-y-auto gap-1">
            {review.images.map((item) => (
              <Image
                key={item}
                src={item}
                alt="Image"
                width={200}
                height={200}
                style={{
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="text-right">
        <Button onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
};

export default ModalShowFile;
