/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { MessageInstance } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { rules } from "../helpers/rulesGeneral";
import { replaceName } from "../helpers/replaceName";
import { handleAPI } from "../apis/request";
import type { VariationModel } from "../models/variationModel";

interface Props {
  onAddNew?: (val: VariationModel) => void;
  onFetch?: () => void;
  mesApi?: MessageInstance;
  select?: VariationModel;
  onCancel?: () => void;
  prefix_api?: string;
}

const AddVariation = (props: Props) => {
  const { onAddNew, mesApi, onFetch, select, onCancel, prefix_api } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (select) {
      form.setFieldsValue(select);
    }
  }, [select]);

  const handleFinish = async (values: any) => {
    const data: any = {};
    for (const key in values) {
      data[key] = values[key] || "";
    }

    data.key = replaceName(data.title);
    const api = `${prefix_api}${select ? `/edit/${select._id}` : "/create"}`;
    try {
      setIsLoading(true);
      const response: any = await handleAPI(
        api,
        data,
        select ? "patch" : "post"
      );
      if (onAddNew) {
        if (!select) {
          onAddNew(response.data);
        } else {
          onAddNew({ ...select, ...data });
        }
      }
      mesApi?.success(response.message);
      if (!select) {
        form.resetFields();
      }
    } catch (error: any) {
      console.log(error);
      mesApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form
        name="variation"
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item name={"title"} label="Title" rules={rules}>
          <Input placeholder="Enter Title" />
        </Form.Item>
        <Form.Item name={"description"} label="Description" rules={[]}>
          <TextArea placeholder="Write something..." rows={3} />
        </Form.Item>
      </Form>
      <Flex gap={6} justify="flex-end">
        <Button
          onClick={() => {
            form.resetFields();
            if (onCancel) {
              onCancel();
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={isLoading}
        >
          {select ? "Update" : "Submit"}
        </Button>
      </Flex>
    </>
  );
};

export default AddVariation;
