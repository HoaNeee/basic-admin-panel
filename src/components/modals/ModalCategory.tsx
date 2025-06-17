/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Modal, TreeSelect } from "antd";
import { useEffect, useState } from "react";
import { Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { rules } from "../../helpers/rulesGeneral";
import { handleAPI } from "../../apis/request";
import type { MessageInstance } from "antd/es/message/interface";
import { replaceName } from "../../helpers/replaceName";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesApi?: MessageInstance;
  categories?: any[];
  onFetch: () => void;
}

const ModalCategory = (props: Props) => {
  const { isOpen, onClose, mesApi, categories, onFetch } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (categories && categories.length > 0) {
      setData(categories);
    }
  }, [categories]);

  const handleFinish = async (values: any) => {
    const data: any = {};

    for (const key in values) {
      data[key] = values[key] || "";
    }
    data.slug = replaceName(data.title || "");

    const api = `/categories/create`;

    try {
      setIsLoading(true);
      const response: any = await handleAPI(api, data, "post");

      mesApi?.success(response.message);
      onFetch();
      closeModal();
    } catch (error: any) {
      console.log(error);
      mesApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      title="Add New Category"
      onOk={() => form.submit()}
      closable={!isLoading}
      okButtonProps={{
        loading: isLoading,
      }}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical" size="large">
        <Form.Item name={"parent_id"} label="Parent Category">
          <TreeSelect treeData={data} placeholder="Parent" allowClear />
        </Form.Item>
        <Form.Item name={"title"} label="Title" rules={rules}>
          <Input placeholder="Enter Title" />
        </Form.Item>
        <Form.Item name={"description"} label="Description" rules={[]}>
          <TextArea placeholder="Write something..." rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCategory;
