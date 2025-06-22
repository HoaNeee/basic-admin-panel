/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import AddVariationOption from "../AddVariationOption";
import type { VariationModel } from "../../models/variationModel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesApi?: MessageInstance;
  onAddNew?: (val: any) => void;
  variation?: VariationModel;
}

const ModalVariationOption = (props: Props) => {
  const { isOpen, onClose, mesApi, onAddNew, variation } = props;

  const closeModal = () => {
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      title="Add New Variation option"
      footer={false}
    >
      <AddVariationOption
        vaiation_id={variation?._id || ""}
        mesApi={mesApi}
        onCancel={onClose}
        p_api="/variation-options"
        variation={variation}
        isModal
        onAddNew={onAddNew}
      />
    </Modal>
  );
};

export default ModalVariationOption;
