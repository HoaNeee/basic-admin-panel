/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  type UploadFile,
  type UploadProps,
} from "antd";
import TextArea from "antd/es/input/TextArea";

import type { MessageInstance } from "antd/es/message/interface";
import { rules } from "../../helpers/rulesGeneral";
import { useEffect, useState } from "react";
import { handleAPI, uploadImage } from "../../apis/request";
import type { PromotionModel } from "../../models/promotionModel";
import dayjs from "dayjs";
import UploadImagePreview from "../UploadImagePreview";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesApi?: MessageInstance;
  onFetch?: () => void;
  promotion?: PromotionModel;
}

const ModalAddPromotion = (props: Props) => {
  const { isOpen, onClose, mesApi, onFetch, promotion } = props;
  const [files, setFiles] = useState<UploadFile[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (promotion) {
      const item: any = { ...promotion };
      item.startAt = dayjs(promotion.startAt);
      if (promotion.endAt) {
        item.endAt = dayjs(promotion.endAt);
      } else {
        delete item.endAt;
      }
      form.setFieldsValue(item);
      setFiles([
        {
          uid: item.thumbnail,
          url: item.thumbnail,
          name: item.thumbnail,
        },
      ]);
    }
  }, [promotion]);

  const handleFinish = async (values: any) => {
    if (!files || files.length <= 0) {
      mesApi?.error("Please choose thumbnail!!");
      return;
    }

    values.startAt = values.startAt.$d.toISOString();
    if (values.endAt) {
      values.endAt = values.endAt.$d.toISOString();
    }
    const data: any = {};
    for (const key in values) {
      data[key] = values[key] || "";
    }
    setIsLoading(true);
    try {
      if (files[0]?.originFileObj) {
        const responseUrl = await uploadImage(
          "thumbnail",
          files[0].originFileObj
        );
        data.thumbnail = responseUrl.data;
      } else {
        data.thumbnail = files[0].url;
      }

      const api = `/promotions/${
        promotion ? "edit/" + promotion._id : "create"
      }`;
      const response: any = await handleAPI(
        api,
        data,
        promotion ? "patch" : "post"
      );
      if (onFetch) {
        onFetch();
      }
      setFiles([]);
      closeModal();
      form.resetFields();
      mesApi?.success(response.message);
    } catch (error: any) {
      mesApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    onClose();
    if (promotion) {
      form.resetFields();
      setFiles([]);
    }
  };

  const handleChangeImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFiles(newFileList);
  };

  return (
    <Modal
      closable={!isLoading}
      open={isOpen}
      onCancel={closeModal}
      title="Add New Promotion"
      centered
      okText="Submit"
      onOk={() => form.submit()}
      okButtonProps={{
        loading: isLoading,
      }}
    >
      <Form
        name="promotion"
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        size="large"
      >
        <div className="my-2">
          <UploadImagePreview
            multiple
            maxCount={1}
            fileList={files}
            onChange={handleChangeImage}
          />
        </div>
        <Form.Item label="Title" name={"title"} rules={rules}>
          <Input placeholder="Enter title" />
        </Form.Item>
        <Form.Item label="Description" name={"description"}>
          <TextArea placeholder="Wirting something..." />
        </Form.Item>

        <Flex gap={10}>
          <Form.Item
            label="Promotion Type"
            name={"promotionType"}
            className="w-full"
            initialValue={"percent"}
          >
            <Select
              defaultActiveFirstOption
              options={[
                {
                  value: "percent",
                  label: "Percent",
                },
                {
                  value: "discount",
                  label: "Discount",
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Value"
            name={"value"}
            className="w-full"
            rules={rules}
          >
            <Input
              min={0}
              type="number"
              placeholder="enter value of promotion"
            />
          </Form.Item>
        </Flex>
        <Flex gap={10}>
          <Form.Item
            label="CODE"
            name={"code"}
            className="w-full"
            rules={rules}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Number of times use"
            name={"maxUse"}
            className="w-full"
            help="Empty will be infinite times"
          >
            <Input min={0} type="number" placeholder="enter number" />
          </Form.Item>
        </Flex>
        <Flex gap={10}>
          <Form.Item
            label="Start"
            name={"startAt"}
            className="w-full"
            rules={rules}
          >
            <DatePicker showTime size="middle" />
          </Form.Item>
          <Form.Item label="End" name={"endAt"} className="w-full">
            <DatePicker showTime size="middle" />
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
};

export default ModalAddPromotion;
