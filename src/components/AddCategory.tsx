/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Form, Input, TreeSelect } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { CategoryModel } from "../models/categoryModel";
import { replaceName } from "../helpers/replaceName";
import { useEffect, useState } from "react";
import { handleAPI } from "../apis/request";
import type { MessageInstance } from "antd/es/message/interface";
import { rules } from "../helpers/rulesGeneral";
import type { TreeSelectModel } from "../models/formModel";

interface Props {
  categories?: TreeSelectModel[];
  onAddNew?: (val: CategoryModel) => void;
  onFetch?: () => void;
  mesApi?: MessageInstance;
  select?: CategoryModel;
  onCancel?: () => void;
}

const AddCategory = (props: Props) => {
  const { categories, onAddNew, mesApi, onFetch, select, onCancel } = props;

  //select is update

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TreeSelectModel[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (categories && categories.length > 0) {
      if (select) {
        const arr = [...categories];
        findSelfCat(arr, select._id);
        setData(arr);
      } else setData(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (select) {
      const arr = [...data];
      findSelfCat(data, select._id);
      setData(arr);
      form.setFieldsValue(select);
    }
  }, [select]);

  const findSelfCat = (data: any[] = [], id = "") => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].value === id) {
        data[i].disabled = true;
      } else {
        data[i].disabled = false;
        findSelfCat(data[i].children, id);
      }
    }
  };

  const handleFinish = async (values: any) => {
    const data: any = {};

    for (const key in values) {
      data[key] = values[key] || "";
    }
    data.slug = replaceName(data.title || "");

    const api = `/categories/${select ? `edit/${select._id}` : "create"}`;
    try {
      setIsLoading(true);
      const response: any = await handleAPI(
        api,
        data,
        select ? "patch" : "post"
      );
      mesApi?.success(response?.message);
      if (onAddNew) {
        if (select) {
          onAddNew({
            ...select,
            ...data,
          });
        } else {
          form.resetFields();
          onAddNew(response?.data);
        }
      } else {
        if (onFetch) {
          form.resetFields();
          onFetch();
        }
      }

      //modal
    } catch (error: any) {
      console.log(error);
      mesApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish} layout="vertical" size="large">
        <Form.Item name={"parent_id"} label="Parent Category">
          <TreeSelect
            treeData={data}
            showSearch
            placeholder="This category is haven't parent"
            allowClear
            treeDefaultExpandAll
            treeNodeFilterProp="title"
          />
        </Form.Item>
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
            if (onCancel) onCancel();
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

export default AddCategory;
