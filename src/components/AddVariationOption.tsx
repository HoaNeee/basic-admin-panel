/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button, Flex, Form, Input, Select } from "antd";
import type {
  VariationModel,
  VariationOptionModel,
} from "../models/variationModel";
import type { MessageInstance } from "antd/es/message/interface";
import { replaceName } from "../helpers/replaceName";
import { handleAPI } from "../apis/request";
import { rules } from "../helpers/rulesGeneral";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router";

interface Props {
  vaiation_id: string;
  onAddNew?: (val: VariationOptionModel) => void;
  onFetch?: () => void;
  mesApi?: MessageInstance;
  select?: VariationOptionModel;
  onCancel?: () => void;
  p_api?: string;
  variation?: VariationModel;
}

const AddVariationOption = (props: Props) => {
  const {
    onAddNew,
    mesApi,
    onFetch,
    select,
    onCancel,
    p_api,
    vaiation_id,
    variation,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
    data.variation_id = vaiation_id;
    const api = `${p_api}${select ? `/edit/${select._id}` : "/create"}`;
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
        <Form.Item label="Variation Title">
          <Select
            defaultValue={vaiation_id}
            options={[
              {
                label: variation?.title || "Variation Name",
                value: vaiation_id,
              },
            ]}
            disabled
          />
        </Form.Item>
        <Form.Item name={"title"} label="Title Option" rules={rules}>
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
            navigate(-1);
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

export default AddVariationOption;
