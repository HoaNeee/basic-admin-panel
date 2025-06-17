/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Divider,
  Form,
  message,
  Select,
  Space,
  TreeSelect,
} from "antd";
import Loading from "../components/Loading";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Editor } from "@tinymce/tinymce-react";
import { FaPlus } from "react-icons/fa6";
import ModalCategory from "../components/modals/ModalCategory";
import { handleAPI } from "../apis/request";
import { useEffect, useRef, useState } from "react";
import { rules } from "../helpers/rulesGeneral";
import { createTree } from "../helpers/createTree";

const AddProduct = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalAddCategory, setOpenModalAddCategory] = useState(false);
  const [categories, setCategories] = useState<any>([]);

  const [mesApi, contextHolderMes] = message.useMessage();

  const [form] = Form.useForm();

  const editorRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getSupplier();
        await getCategories();
      } catch (error: any) {
        mesApi.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // const _log = () => {
  //   if (editorRef.current) {
  //     console.log(editorRef.current.getContent());
  //   }
  // };

  const handleFinish = (values: any) => {
    console.log(values);
  };

  const getSupplier = async () => {
    const api = `/suppliers`;

    const response = await handleAPI(api);

    let data = response.data ?? [];
    data = data.map((item: any) => {
      return {
        label: item.name,
        value: item.slug,
      };
    });

    setSuppliers(data);
  };

  const getCategories = async () => {
    const api = `/categories`;

    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      const data = response.data.map((item: any) => {
        return {
          value: item._id,
          parent_id: item.parent_id,
          title: item.title,
        };
      });
      const arr = createTree(data, "");
      setCategories(arr);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideModalCategory = () => {
    setOpenModalAddCategory(false);
  };
  return (
    <>
      {contextHolderMes}
      <div className="h-full w-full relative">
        {isLoading && (
          <>
            <Loading type="screen" />
          </>
        )}
        <h3 className="mb-3 text-2xl font-semibold">Add Product</h3>
        <Form
          name="Add-product"
          onFinish={handleFinish}
          form={form}
          layout="vertical"
          size="large"
        >
          <div className="w-full h-full flex gap-5">
            <div className="w-3/5">
              <Form.Item label="Title" name={"title"} rules={rules}>
                <Input allowClear placeholder="Enter title" />
              </Form.Item>

              <Form.Item label="Short Description" name={"shortDescription"}>
                <TextArea
                  rows={3}
                  allowClear
                  placeholder="write something..."
                />
              </Form.Item>
              <Editor
                apiKey={import.meta.env.VITE_API_KEY_EDITOR}
                onInit={(_evt: any, editor: any) =>
                  (editorRef.current = editor)
                }
                initialValue="<p>This is the initial content.</p>"
                init={{
                  height: 350,
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </div>
            <div className="flex-1 mt-4 flex flex-col gap-3">
              <Card size="small">
                <Space>
                  <Button size="middle">Cancel</Button>
                  <Button
                    size="middle"
                    type="primary"
                    onClick={() => form.submit()}
                  >
                    Add new
                  </Button>
                </Space>
              </Card>

              <Card title="Category">
                <Form.Item
                  name={"categories"}
                  style={{
                    margin: 0,
                  }}
                >
                  <TreeSelect
                    treeData={categories}
                    className="w-full"
                    allowClear
                    placeholder="Category"
                    popupRender={(menu) => {
                      return (
                        <>
                          {menu}
                          <Divider
                            style={{
                              margin: "2px 0",
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => setOpenModalAddCategory(true)}
                          >
                            <FaPlus />
                            Add new
                          </Button>
                        </>
                      );
                    }}
                  />
                </Form.Item>
              </Card>
              <Card title="Supplier">
                <Form.Item name={"supplier"} style={{ margin: 0 }}>
                  <Select
                    options={suppliers}
                    className="w-full"
                    allowClear
                    placeholder="Supplier"
                    showSearch
                  />
                </Form.Item>
              </Card>
            </div>
          </div>
        </Form>
      </div>

      <ModalCategory
        isOpen={openModalAddCategory}
        onClose={hideModalCategory}
        mesApi={mesApi}
        categories={categories}
        onFetch={getCategories}
      />
    </>
  );
};

export default AddProduct;
