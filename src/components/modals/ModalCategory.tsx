/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from "antd";

import type { MessageInstance } from "antd/es/message/interface";
import AddCategory from "../AddCategory";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesApi?: MessageInstance;
  categories?: any[];
  onFetch: () => void;
}

const ModalCategory = (props: Props) => {
  const { isOpen, onClose, mesApi, categories, onFetch } = props;

  const closeModal = () => {
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      title="Add New Category"
      footer={false}
    >
      <AddCategory
        categories={categories}
        onFetch={() => {
          onFetch();
          closeModal();
        }}
        mesApi={mesApi}
      />
    </Modal>
  );
};

export default ModalCategory;
