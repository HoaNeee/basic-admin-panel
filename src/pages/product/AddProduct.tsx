/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  InputNumber,
  message,
  Select,
  Space,
  TreeSelect,
  type UploadFile,
  type UploadProps,
} from "antd";
import Loading from "../../components/Loading";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Editor } from "@tinymce/tinymce-react";
import { FaPlus } from "react-icons/fa6";
import ModalCategory from "../../components/modals/ModalCategory";
import { handleAPI, uploadImage, uploadImageMulti } from "../../apis/request";
import { useEffect, useRef, useState } from "react";
import { rules } from "../../helpers/rulesGeneral";
import { createTree } from "../../helpers/createTree";
import type { Supplier } from "../../models/supplier";
import type { CategoryModel } from "../../models/categoryModel";
import type { SelectModel } from "../../models/formModel";
import type { VariationModel } from "../../models/variationModel";
import { useNavigate } from "react-router";
import UploadImage from "../../components/UploadImage";
import type { SubProductModel } from "../../models/productModel";
import UploadImagePreview from "../../components/UploadImagePreview";
import ProductVariations from "./ProductVariations";
import { EyeOutlined } from "@ant-design/icons";
import { RiRobot2Line } from "react-icons/ri";
import ModalInput from "../../components/modals/ModalInput";

const AddProduct = () => {
  const [suppliers, setSuppliers] = useState<SelectModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openModalAddCategory, setOpenModalAddCategory] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [productType, setProductType] = useState("simple");
  const [variations, setVariations] = useState<VariationModel[]>([]);
  const [dataSelectVariation, setDataSelectVariation] = useState<SelectModel[]>(
    []
  );
  const [subProducts, setSubProducts] = useState<SubProductModel[]>([]);
  const [albumProduct, setAlbumProduct] = useState<UploadFile[]>([]);
  const [thumbnail, setThumbnail] = useState<File>();
  const [openModalInput, setOpenModalInput] = useState(false);
  const [dataGenarateVariations, setDataGenarateVariations] = useState<any>();

  const navigate = useNavigate();

  const [form] = Form.useForm();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getSupplier();
        await getCategories();
        await getVariations();
      } catch (error: any) {
        console.log(error);
        message.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFinish = async (values: any) => {
    const content = editorRef.current.getContent();
    try {
      setIsCreating(true);
      const data: any = {};
      for (const key in values) {
        if (key === "categories") {
          if (!values[key]) data[key] = [];
          else data[key] = values[key];
        } else if (key === "createPurchaseOrder") {
          data[key] = values[key] ? true : false;
        } else {
          data[key] = values[key] || "";
        }
      }

      data.content = content;
      data.productType = productType;
      const items = [];

      for (const item of subProducts) {
        items.push({
          options: item?.key_combi?.split("-"),
          price: item?.price || 0,
          stock: item?.stock || 0,
          thumbnail: item?.thumbnail || "",
          discountedPrice: item?.discountedPrice,
          SKU: item?.SKU,
          cost: item?.cost,
          createPurchaseOrder: item?.createPurchaseOrder || false,
        });
      }

      const api = `/products/create`;

      const album = albumProduct.map((item) => item.originFileObj || item.url);
      if (album && album.length > 0) {
        const payload_img = [];
        const url_string = [];
        for (const img of album) {
          if (typeof img === "string") {
            url_string.push(img);
          } else {
            payload_img.push(img);
          }
        }
        const payload = [];
        if (payload_img.length > 0) {
          const res = await uploadImageMulti("images", payload_img);
          payload.push(...res.data);
        }
        if (url_string.length > 0) {
          payload.push(...url_string);
        }
        data.images = payload.flat();
      }
      if (thumbnail) {
        if (typeof thumbnail === "string") {
          data.thumbnail = thumbnail;
        } else {
          const res = await uploadImage("thumbnail", thumbnail);
          data.thumbnail = res.data;
        }
      }

      for (const item of items) {
        if (item.thumbnail && typeof item.thumbnail !== "string") {
          const res = await uploadImage("thumbnail", item.thumbnail);
          item.thumbnail = res.data;
        }
      }

      const payload = {
        data: { ...data },
        subProducts: [...items],
      };

      const response: any = await handleAPI(api, payload, "post");
      navigate(`/inventories/edit-product/${response.data._id}`);
      message.success(response.message, 3);
    } catch (error: any) {
      console.log(error);
      message.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const getSupplier = async () => {
    const api = `/suppliers`;
    const response = await handleAPI(api);
    let data = response.data ?? [];
    data = data.map((item: Supplier) => {
      return {
        label: item.name,
        value: item._id,
      };
    });
    setSuppliers(data);
  };

  const getCategories = async () => {
    const api = `/categories`;

    const response = await handleAPI(api);
    const data = response.data.map((item: any) => {
      return {
        value: item._id,
        parent_id: item.parent_id,
        title: item.title,
      };
    });
    const arr = createTree(data, "", "value");
    setCategories(arr);
  };

  const getVariations = async () => {
    const api = `/variations`;
    const response = await handleAPI(api);
    setVariations(response.data);
    const data = [...response.data];
    setDataSelectVariation(
      data.map((item) => {
        return {
          label: item.title,
          value: item._id,
        };
      })
    );
  };

  const handleChangeImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setAlbumProduct(newFileList);
  };

  const hideModalCategory = () => {
    setOpenModalAddCategory(false);
  };

  const handleAIGenerate = async (value: string) => {
    try {
      setIsLoading(true);
      const api = `/ai-assistant/product`;
      const response = await handleAPI(api, { input: value }, "post");
      const data = response.data;
      console.log(data);
      if (data.title) {
        form.setFieldsValue({
          title: data.title,
          shortDescription: data.shortDescription,
          categories: data.categories,
          supplier_id: data.supplier_id,
          SKU: data.SKU,
        });

        if (data.price) {
          form.setFieldsValue({
            price: data.price,
            stock: data.stock,
            cost: data.cost,
            discountedPrice: data.discountedPrice,
          });
        }
        editorRef.current.setContent(data.content);
        setProductType(data.productType);
        setThumbnail(data.thumbnail);
        setAlbumProduct(
          data.album.map((item: string) => {
            return {
              uid: item,
              name: item,
              status: "done",
              url: item,
            };
          })
        );

        if (data.productType === "variations") {
          setDataGenarateVariations({
            variation_ids: data.variation_ids,
            sub_products: data.sub_products,
            option_ids: data.options_ids,
          });
        }
      }
      setOpenModalInput(false);
    } catch (error) {
      console.log(error);
      message.error("Failed to generate content with AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="h-full w-full relative p-3 pb-8">
        {(isLoading || isCreating) && <Loading type="superScreen" />}
        <div className="flex items-center justify-between mb-5 rounded-md shadow-sm py-4 px-6 bg-white">
          <h3 className="text-xl font-semibold">Add Product</h3>
          <Space wrap={true}>
            <Button
              icon={<RiRobot2Line />}
              onClick={() => setOpenModalInput(true)}
            >
              AI Generate
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => {}}>
              Preview
            </Button>
          </Space>
        </div>
        <Form
          name="Add-product"
          onFinish={handleFinish}
          form={form}
          layout="vertical"
          size="large"
        >
          <div className="w-full h-full flex gap-5 md:flex-row flex-col">
            <div className="md:w-3/5 w-full">
              <Form.Item label="Title" name={"title"} rules={rules}>
                <Input allowClear placeholder="Enter title" name="title" />
              </Form.Item>

              <Form.Item label="Type of product">
                <Select
                  value={productType}
                  options={[
                    {
                      label: "Simple product",
                      value: "simple",
                    },
                    {
                      label: "Variations product",
                      value: "variations",
                    },
                  ]}
                  onChange={(value) => {
                    setProductType(value);
                  }}
                />
              </Form.Item>

              {productType === "simple" && (
                <div className="flex gap-2">
                  <Form.Item label="Cost" name={"cost"} className="w-full">
                    <Input
                      placeholder="Enter Cost"
                      style={{ width: "100%" }}
                      name="cost"
                    />
                  </Form.Item>

                  <Form.Item label="Stock" name={"stock"} className="w-full">
                    <InputNumber
                      type="number"
                      placeholder="Enter stock"
                      style={{ width: "100%" }}
                      name="stock"
                    />
                  </Form.Item>
                </div>
              )}

              {productType === "simple" && (
                <div className="flex gap-2">
                  <Form.Item label="Price" name={"price"} className="w-full">
                    <InputNumber
                      type="number"
                      placeholder="Enter price"
                      style={{
                        width: "100%",
                      }}
                      name="price"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Discounted Price"
                    name={"discountedPrice"}
                    className="w-full"
                  >
                    <InputNumber
                      type="number"
                      placeholder="Enter discounted price"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              )}

              <div className="flex">
                <Form.Item label="SKU" name={"SKU"} className="w-full">
                  <Input
                    placeholder="Enter SKU"
                    style={{ width: "100%" }}
                    name="SKU"
                  />
                </Form.Item>
              </div>

              <Form.Item label="Short Description" name={"shortDescription"}>
                <TextArea
                  rows={3}
                  allowClear
                  placeholder="write something..."
                  name="shortDescription"
                />
              </Form.Item>
              <div>
                <p className="mb-2">Content</p>
                <Editor
                  apiKey={import.meta.env.VITE_API_KEY_EDITOR}
                  onInit={(_evt: any, editor: any) =>
                    (editorRef.current = editor)
                  }
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
            </div>
            <div className="flex-1 mt-4 flex flex-col gap-5">
              <Card size="small">
                <Space>
                  <Button size="middle" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button
                    size="middle"
                    type="primary"
                    onClick={() => form.submit()}
                  >
                    Add new
                  </Button>
                </Space>
              </Card>
              <Card title="Category" size="small">
                <Form.Item
                  name={"categories"}
                  style={{
                    margin: 0,
                  }}
                >
                  <TreeSelect
                    treeNodeFilterProp="title"
                    size="middle"
                    treeData={categories}
                    className="w-full"
                    allowClear
                    placeholder="Category"
                    multiple
                    treeDefaultExpandAll
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
              <Card title="Supplier" size="small">
                <Form.Item name={"supplier_id"} style={{ margin: 0 }}>
                  <Select
                    size="middle"
                    options={suppliers}
                    className="w-full"
                    allowClear
                    placeholder="Supplier"
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Card>
              <Card title="Thumbnail" size="small">
                <UploadImage
                  file={
                    thumbnail
                      ? typeof thumbnail === "string"
                        ? thumbnail
                        : URL.createObjectURL(thumbnail)
                      : undefined
                  }
                  onDelete={() => setThumbnail(undefined)}
                  onChange={(e) => {
                    if (e.target.files) {
                      setThumbnail(e.target.files[0]);
                    }
                  }}
                />
              </Card>
              <Card title="Album" size="small">
                <UploadImagePreview
                  multiple
                  fileList={albumProduct}
                  onChange={handleChangeImage}
                />
              </Card>
              {productType === "simple" && (
                <Card style={{ padding: 0 }} size="small">
                  <Form.Item name={"createPurchaseOrder"} style={{ margin: 0 }}>
                    <div className="flex items-center gap-2">
                      <Checkbox id="createPurchaseOrder" />
                      <label htmlFor="createPurchaseOrder">
                        Create Purchase Order for this product
                      </label>
                    </div>
                  </Form.Item>
                </Card>
              )}
              =
              <Card style={{ padding: 0 }} size="small">
                <Form.Item name={"isEmbedding"} style={{ margin: 0 }}>
                  <div className="flex items-center gap-2">
                    <Checkbox id="embedding" />
                    <label htmlFor="embedding">
                      Embedding this product to VectorDB
                    </label>
                  </div>
                </Form.Item>
              </Card>
            </div>
          </div>
          {productType === "variations" && (
            <ProductVariations
              message={message}
              variations={variations}
              setIsLoading={setIsLoading}
              dataSelectVariation={dataSelectVariation}
              setDataSelectVariation={setDataSelectVariation}
              subProducts={subProducts}
              setSubProducts={setSubProducts}
              dataGenarateVariations={dataGenarateVariations}
            />
          )}
        </Form>
      </div>

      <ModalCategory
        isOpen={openModalAddCategory}
        onClose={hideModalCategory}
        mesApi={message}
        categories={categories}
        onFetch={getCategories}
      />
      <ModalInput
        open={openModalInput}
        onOk={(value) => handleAIGenerate(value)}
        onCancel={() => setOpenModalInput(false)}
        messageApi={message}
        title="Ask the AI assistant to help you with writing or editing your product"
        isLoading={isLoading}
      />
    </>
  );
};

export default AddProduct;
