/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Modal, Select } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import type { SelectModel } from "../../models/formModel";
import { rules } from "../../helpers/rulesGeneral";
import { useForm } from "antd/es/form/Form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesApi?: MessageInstance;
  onFetch?: () => void;
}

const ModalPurchaseOrder = (props: Props) => {
  const { isOpen, onClose, mesApi, onFetch } = props;

  const [listSKU, setListSKU] = useState<SelectModel[]>([]);

  const [form] = useForm();

  useEffect(() => {}, []);

  const closeModal = () => {
    onClose();
  };

  const handleFinish = (values: any) => {
    console.log(values);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      title="New Purchase Order"
      footer={false}
    >
      <Form
        name="purchase-order"
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item name={"listSKU"} label="SKU" rules={[{ required: true }]}>
          <Select
            options={listSKU}
            mode="multiple"
            showSearch
            allowClear
            placeholder="Choose SKU"
          />
        </Form.Item>
        <Form.Item label="Title" name={"title"} rules={rules}>
          <Input placeholder="Enter title" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalPurchaseOrder;
