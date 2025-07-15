/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Flex,
  Form,
  Input,
  TreeSelect,
  type UploadFile,
  type UploadProps,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import type { CategoryModel } from "../models/categoryModel";
import { replaceName } from "../helpers/replaceName";
import { useEffect, useState } from "react";
import { handleAPI, uploadImage } from "../apis/request";
import type { MessageInstance } from "antd/es/message/interface";
import { rules } from "../helpers/rulesGeneral";
import type { TreeSelectModel } from "../models/formModel";
import UploadImagePreview from "./UploadImagePreview";

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
  const [files, setFiles] = useState<UploadFile[]>();

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

      if (select.thumbnail) {
        const file: any = {
          uid: select?.thumbnail || Date.now(),
          name: select?.thumbnail || Date.now(),
          url: select.thumbnail,
        };
        setFiles([file]);
      } else if (files && files.length > 0) {
        setFiles([]);
      }
    }
  }, [select]);

  const findSelfCat = (data: any[] = [], id = "") => {
    for (let i = 0; i < data?.length || 0; i++) {
      if (data[i].value === id) {
        data[i].disabled = true;
      } else {
        data[i].disabled = false;
        findSelfCat(data[i].children, id);
      }
    }
  };

  const handleFinish = async (values: any) => {
    setIsLoading(true);
    const data: any = {};

    for (const key in values) {
      data[key] = values[key] || "";
    }
    data.slug = replaceName(data.title || "");

    if (files && files.length > 0) {
      const file = files[0];

      if (typeof file !== "string") {
        const responseUrl = await uploadImage("thumbnail", file.originFileObj);
        data.thumbnail = responseUrl.data;
      }
    } else if (select) {
      data.thumbnail = "";
    }

    const api = `/categories/${select ? `edit/${select._id}` : "create"}`;
    try {
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
          setFiles([]);
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

  const handleChangeImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFiles(newFileList);
  };

  return (
    <>
      <Form form={form} onFinish={handleFinish} layout="vertical" size="large">
        <div className="my-4">
          <UploadImagePreview
            fileList={files}
            multiple
            maxCount={1}
            onChange={handleChangeImage}
          />
        </div>

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
          <Input placeholder="Enter Title" name="title" />
        </Form.Item>
        <Form.Item name={"description"} label="Description" rules={[]}>
          <TextArea placeholder="Write something..." rows={3} />
        </Form.Item>
      </Form>
      <Flex gap={6} justify="flex-end">
        <Button
          onClick={() => {
            form.resetFields();
            if (files && files.length > 0) {
              setFiles([]);
            }
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
