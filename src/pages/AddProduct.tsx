/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  InputNumber,
  message,
  Select,
  Space,
  theme,
  TreeSelect,
  Upload,
  type UploadFile,
  type UploadProps,
} from "antd";
import Loading from "../components/Loading";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Editor } from "@tinymce/tinymce-react";
import { FaPlus } from "react-icons/fa6";
import ModalCategory from "../components/modals/ModalCategory";
import { handleAPI, uploadImage, uploadImageMulti } from "../apis/request";
import { useEffect, useRef, useState } from "react";
import { rules } from "../helpers/rulesGeneral";
import { createTree } from "../helpers/createTree";
import type { Supplier } from "../models/supplier";
import type { CategoryModel } from "../models/categoryModel";
import type { SelectModel } from "../models/formModel";
import type {
  VariationChoosedModel,
  VariationModel,
  VariationOptionChoosedModel,
} from "../models/variationModel";
import { TiDelete } from "react-icons/ti";
import { BiSolidPlusSquare } from "react-icons/bi";
import { useNavigate } from "react-router";
import { genCombinations } from "../helpers/genCombinations";
import UploadImage from "../components/UploadImage";
import ModalVariationOption from "../components/modals/ModalVariationOption";
import type { SubProductModel } from "../models/productModel";

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

  const [listVariationChoosed, setListVariationChoosed] = useState<
    VariationChoosedModel[]
  >([]);

  const [listVariationOptionChoosed, setListVariationOptionChoosed] = useState<
    VariationOptionChoosedModel[]
  >([]);

  const [sampleSubProductVariation, setSampleSubProductVariation] = useState<
    any[]
  >([]);

  const [subProducts, setSubProducts] = useState<SubProductModel[]>([]);

  const [albumProduct, setAlbumProduct] = useState<UploadFile[]>([]);
  const [thumbnail, setThumbnail] = useState<any>();
  const [previewImage, setPreviewImage] = useState<any>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [openModalAddVariationOption, setOpenModalAddVariationOption] =
    useState(false);
  const [variationSelected, setVariationSelected] = useState<VariationModel>();

  const navigate = useNavigate();

  const [mesApi, contextHolderMes] = message.useMessage();
  const [form] = Form.useForm();
  const editorRef = useRef<any>(null);
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        await getSupplier();
        await getCategories();
        await getVariations();
      } catch (error: any) {
        console.log(error);
        mesApi.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const items = [...dataSelectVariation];

    for (const item of items) {
      const exist = listVariationChoosed.find((it) => it.key === item.value);
      if (exist) {
        item.disabled = true;
      } else item.disabled = false;
    }

    setDataSelectVariation(items);
  }, [listVariationChoosed]);

  const handleFinish = async (values: any) => {
    const content = editorRef.current.getContent();
    try {
      setIsCreating(true);
      const data: any = {};
      for (const key in values) {
        if (key === "categories") {
          if (!values[key]) data[key] = [];
          else data[key] = values[key];
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
        });
      }

      const api = `/products/create`;

      const album = albumProduct.map((item) => item.originFileObj);
      if (album && album.length > 0) {
        const res = await uploadImageMulti("images", album);
        data.images = res.data;
      }
      if (thumbnail) {
        const res = await uploadImage("thumbnail", thumbnail);
        data.thumbnail = res.data;
      }

      for (const item of items) {
        if (item?.thumbnail) {
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
      mesApi.success(response.message);
    } catch (error: any) {
      console.log(error);
      mesApi.error(error.message);
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

  const getVariationOptions = async (variation_id: string) => {
    const api = `/variation-options?variation_id=${variation_id}`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);

      return response.data;
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const findItem = (data: any[] = [], key: string) => {
    const item = data.find((it) => it._id === key);
    return item;
  };

  const handleCreateSubProduct = () => {
    if (
      listVariationChoosed.length !== listVariationOptionChoosed.length ||
      listVariationOptionChoosed.some((it) => it?.options?.length === 0)
    ) {
      mesApi.error(
        "Please choose at least one option or delete variation empty!"
      );
      return;
    }
    const arr = [...listVariationOptionChoosed];

    const combinations = genCombinations(arr);

    const items = [];
    for (const item of combinations) {
      const key = item.map((it: any) => it.value).join("-");
      items.push({
        key_combi: key,
        price: "",
        stock: "",
        thumbnail: "",
      });
    }

    setSubProducts(items);
    setSampleSubProductVariation([...combinations]);
  };

  const handleChangeImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setAlbumProduct(newFileList);
  };

  const handlePreviewImage = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      if (file.originFileObj) {
        file.preview = URL.createObjectURL(file.originFileObj);
      }
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const renderButtonUpload = () => {
    return (
      <div className="flex flex-col items-center text-gray-400">
        <FaPlus size={20} />
        <p>Upload</p>
      </div>
    );
  };

  const customRequest = (option: any) => {
    if (option.onSuccess) {
      option.onSuccess(option.file);
    }
    return option.file;
  };

  const hideModalCategory = () => {
    setOpenModalAddCategory(false);
  };

  const hideModalVariationOption = () => {
    setOpenModalAddVariationOption(false);
    setVariationSelected(undefined);
  };

  return (
    <>
      {contextHolderMes}
      <div className="h-full w-full relative pb-10">
        {(isLoading || isCreating) && (
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
                  {
                    <Form.Item label="Price" name={"price"} className="w-full">
                      <InputNumber
                        type="number"
                        placeholder="Enter price"
                        style={{
                          width: "100%",
                        }}
                      />
                    </Form.Item>
                  }
                  <Form.Item label="Stock" name={"stock"} className="w-full">
                    <InputNumber
                      type="number"
                      placeholder="Enter stock"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              )}

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
                initialValue={"<p>This is the initial content.</p>"}
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
              <Card title="Thumbail" size="small">
                <UploadImage
                  file={thumbnail}
                  onDelete={() => setThumbnail(undefined)}
                  onChange={(e) => {
                    if (e.target.files) {
                      setThumbnail(e.target.files[0]);
                    }
                  }}
                  local
                />
              </Card>

              <Card title="Ablum" size="small">
                <UploadImage
                  fileList={albumProduct}
                  multiple
                  onAfterChangePreview={(visible) =>
                    !visible && setPreviewImage("")
                  }
                  onChangePreview={(visible) => setPreviewOpen(visible)}
                  previewOpen={previewOpen}
                  previewFile={previewImage}
                  onPreview={handlePreviewImage}
                  onChange={handleChangeImage}
                  title="Upload"
                />
              </Card>
            </div>
          </div>
          {productType === "variations" && (
            <div className="mt-3">
              <Card
                title={
                  <div className=" flex gap-4 items-center">
                    <p>Variations</p>
                    <div className="w-full">
                      <Select
                        value={""}
                        size="middle"
                        options={[
                          {
                            label: "Add variation",
                            value: "",
                            disabled: true,
                          },
                          ...dataSelectVariation,
                        ]}
                        placeholder="Add variation"
                        onChange={async (value) => {
                          const set = new Set([
                            ...listVariationChoosed.map((it) => it.key),
                          ]);
                          if (set.has(value)) {
                            mesApi.error("Already existing option!");
                          } else {
                            const data = await getVariationOptions(value);
                            setListVariationChoosed([
                              ...listVariationChoosed,
                              {
                                key: value,
                                select: data.map((item: any) => {
                                  return {
                                    label: item.title,
                                    value: item._id,
                                  };
                                }),
                              },
                            ]);
                          }
                        }}
                      />
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col gap-2">
                  {listVariationChoosed.map((item: VariationChoosedModel) => (
                    <div key={item.key} className="flex gap-4 items-center">
                      <div className="rounded border py-1 px-2 border-[#ddd] w-2/12 text-center">
                        {findItem(variations, item.key)?.title || ""}
                      </div>
                      <div className="flex-1 flex gap-2 items-center">
                        <Form.Item
                          style={{
                            width: "80%",
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          <Select
                            optionFilterProp="label"
                            options={
                              listVariationChoosed.find(
                                (it) => it.key === item.key
                              )?.select || []
                            }
                            placeholder="Choose options"
                            size="middle"
                            style={{
                              width: "100%",
                            }}
                            mode="tags"
                            onChange={(_val, option: any) => {
                              const items = [...listVariationOptionChoosed];
                              const index = items.findIndex(
                                (it) => it.key_variation === item.key
                              );

                              if (index !== -1) {
                                if (option?.length > 0) {
                                  items[index].options = option;
                                } else {
                                  items.splice(index, 1);
                                }
                              } else {
                                items.push({
                                  key_variation: item.key,
                                  title:
                                    findItem(variations, item.key)?.title ||
                                    item.key,
                                  options: option,
                                });
                              }
                              setListVariationOptionChoosed(items);
                            }}
                          />
                        </Form.Item>
                        <div className="flex gap-1.5 items-center">
                          <TiDelete
                            size={20}
                            color="red"
                            className="cursor-pointer"
                            onClick={() => {
                              setListVariationChoosed(
                                listVariationChoosed.filter(
                                  (it) => it.key !== item.key
                                )
                              );

                              const index =
                                listVariationOptionChoosed.findIndex(
                                  (it) => it.key_variation === item.key
                                );
                              if (index !== -1) {
                                listVariationOptionChoosed.splice(index, 1);
                              }
                              setListVariationOptionChoosed(
                                listVariationOptionChoosed
                              );
                            }}
                            title="Delete this field"
                          />

                          <BiSolidPlusSquare
                            size={20}
                            color={"blue"}
                            className="cursor-pointer"
                            title="Add new value"
                            onClick={() => {
                              const variation = variations.find(
                                (it) => it._id === item.key
                              );
                              setVariationSelected(variation);
                              setOpenModalAddVariationOption(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {
                  <div className="text-right mt-4">
                    <Button
                      size="middle"
                      type="primary"
                      onClick={handleCreateSubProduct}
                    >
                      Create
                    </Button>
                  </div>
                }
                <div className="mt-5 font-medium">Variations Of Products:</div>
                {sampleSubProductVariation &&
                  sampleSubProductVariation.length > 0 && (
                    <div className="my-4">
                      <Collapse
                        bordered={false}
                        style={{ background: "white" }}
                        size="middle"
                        items={sampleSubProductVariation.map((item, index) => {
                          const label = item
                            .map((it: any) => it.label)
                            .join(" - ");

                          const key_combi = item
                            .map((it: any) => it.value)
                            .join("-");

                          const it = subProducts.find(
                            (el) => el.key_combi === key_combi
                          );

                          return {
                            key: index,
                            label: <p className="font-medium">{label}</p>,
                            children: (
                              <div>
                                <Card style={{ borderRadius: 0 }}>
                                  <div className="mb-2">
                                    <Upload
                                      maxCount={1}
                                      listType="picture-card"
                                      onChange={(props) => {
                                        const { fileList } = props;

                                        const items = [...subProducts];
                                        const idx = items.findIndex(
                                          (el) => el.key_combi === key_combi
                                        );
                                        if (idx !== -1) {
                                          items[idx].thumbnail =
                                            fileList[0]?.originFileObj || "";
                                          setSubProducts(items);
                                        }
                                      }}
                                      customRequest={customRequest}
                                      onPreview={() => {}}
                                    >
                                      {renderButtonUpload()}
                                    </Upload>
                                  </div>
                                  <div className="flex gap-3 w-full">
                                    <div className="w-full">
                                      <label>Price: </label>
                                      <Input
                                        value={it?.price}
                                        placeholder="Enter Price"
                                        name="price"
                                        onChange={(e) => {
                                          const { value } = e.target;
                                          const items = [...subProducts];
                                          const idx = items.findIndex(
                                            (el) => el.key_combi === key_combi
                                          );
                                          if (idx !== -1) {
                                            items[idx]["price"] = value;
                                            setSubProducts(items);
                                          }
                                        }}
                                        type="number"
                                      />
                                    </div>
                                    <div className="w-full">
                                      <label>Stock: </label>
                                      <Input
                                        placeholder="Enter Stock"
                                        name="stock"
                                        type="number"
                                        min={0}
                                        onChange={(e) => {
                                          const { value } = e.target;
                                          const items = [...subProducts];
                                          const idx = items.findIndex(
                                            (el) => el.key_combi === key_combi
                                          );
                                          if (idx !== -1) {
                                            items[idx]["stock"] = value;
                                            setSubProducts(items);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </Card>
                              </div>
                            ),
                            style: {
                              marginBottom: 10,
                              background: "#f2f0f0",
                              borderRadius: token.borderRadiusLG,
                              border: "none",
                              padding: 0,
                            },
                            styles: {
                              body: {
                                padding: 0,
                              },
                            },
                          };
                        })}
                      />
                    </div>
                  )}
              </Card>
            </div>
          )}
        </Form>
      </div>

      <ModalCategory
        isOpen={openModalAddCategory}
        onClose={hideModalCategory}
        mesApi={mesApi}
        categories={categories}
        onFetch={getCategories}
      />

      <ModalVariationOption
        isOpen={openModalAddVariationOption}
        onClose={hideModalVariationOption}
        mesApi={mesApi}
        onAddNew={async () => {
          if (variationSelected) {
            const data = await getVariationOptions(variationSelected?._id);
            const items = [...listVariationChoosed];
            const idx = items.findIndex(
              (item) => item.key === variationSelected?._id
            );

            if (idx !== -1) {
              items[idx].select = data.map((item: any) => {
                return {
                  label: item.title,
                  value: item._id,
                };
              });
              setListVariationChoosed(items);
            }
          }
        }}
        variation={variationSelected}
      />
    </>
  );
};

export default AddProduct;
