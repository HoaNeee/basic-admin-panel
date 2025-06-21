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
import type { Supplier } from "../models/supplier";
import type { CategoryModel } from "../models/categoryModel";
import type { SelectModel } from "../models/formModel";
import type { VariationModel } from "../models/variationModel";
import { TiDelete } from "react-icons/ti";
import { BiSolidPlusSquare } from "react-icons/bi";
import { useParams } from "react-router";
import type { ProductModel } from "../models/productModel";

const UpdateProduct = () => {
  const [suppliers, setSuppliers] = useState<SelectModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalAddCategory, setOpenModalAddCategory] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [productType, setProductType] = useState("simple");
  const [variations, setVariations] = useState<VariationModel[]>([]);
  const [dataSelectVariation, setDataSelectVariation] = useState<SelectModel[]>(
    []
  );
  const [listVariationChoosed, setListVariationChoosed] = useState<any[]>([]);
  /*listVariation -> select -> 
    {
      key: string,
      select: []
    }
  */
  const [listVariationOptionChoosed, setListVariationOptionChoosed] = useState<
    any[]
  >([]);
  /* listVariationOption ->
      key_variation: string,
      title: string,
      options: {
        label: string,
        value: string
      },
  */
  const [sampleSubProductVariation, setSampleSubProductVariation] = useState<
    any[]
  >([]);

  /*
    [
      {
        label: string,
        value: string,
      }
    ]
  */

  const [subProducts, setSubProducts] = useState<any[]>([]);
  /*
    {
      key_combi: string,
      price: string,
      stock: string,
      sub_product_id: string
    }
  */
  const [productDetail, setProductDetail] = useState<ProductModel>();

  const [mesApi, contextHolderMes] = message.useMessage();
  const [form] = Form.useForm();
  const editorRef = useRef<any>(null);

  const { token } = theme.useToken();

  const params = useParams();

  const product_id = params.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getSupplier();
        await getCategories();

        await getVariations();
        if (product_id) {
          await getProductDetail(product_id);
        }
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

    const data: any = {};
    for (const key in values) {
      data[key] = values[key] || "";
    }

    data.content = content;
    data.productType = productType;
    const items = [];

    for (const item of subProducts) {
      items.push({
        options: item.key_combi.split("-"),
        price: item?.price || "",
        stock: item?.stock || "",
      });
    }

    const dataSend = {
      data: { ...data },
      subProducts: [...items],
    };
    console.log(dataSend);
    // const api = `/products/create`;
    // try {
    //   const response = await handleAPI(api, dataSend, "post");
    //   console.log(response);
    // } catch (error: any) {
    //   console.log(error);
    //   mesApi.error(error.message);
    // }
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
      const arr = createTree(data, "", "value");
      setCategories(arr);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariations = async () => {
    const api = `/variations`;
    const response = await handleAPI(api);
    const data = [...response.data];
    setVariations(response.data);
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

  const hideModalCategory = () => {
    setOpenModalAddCategory(false);
  };

  const getProductDetail = async (product_id: string) => {
    const api = `/products/detail/${product_id}`;

    const response: any = await handleAPI(api);

    if (response.dataSubProduct && response.dataSubProduct.length > 0) {
      const data = [...response.dataSubProduct];

      setSampleSubProductVariation(data.map((item: any) => item.options));

      const items = data.map((item) => {
        return {
          key_combi: item.options.map((it: any) => it.value).join("-"),
          price: item.price,
          stock: item.stock,
          sub_product_id: item._id,
        };
      });

      setSubProducts(items);
    }

    const dataVariationIds = response.dataVariationIds;

    setProductDetail({
      ...response.data,
      variation_ids: dataVariationIds,
    });

    form.setFieldsValue(response.data);
    setProductType(response.data.productType);

    const items = [];
    for (const item of dataVariationIds) {
      const data = await getVariationOptions(item);
      items.push({
        key: item,
        select: data.map((item: any) => {
          return {
            label: item.title,
            value: item._id,
          };
        }),
      });
    }
    setListVariationChoosed(items);

    setListVariationOptionChoosed(
      response.dataVariationOptions.map((item: any) => {
        return {
          ...item,
          key_variation: item._id,
        };
      })
    );
  };

  const handleSaveSubProduct = async () => {
    if (
      listVariationChoosed.length !== listVariationOptionChoosed.length ||
      listVariationOptionChoosed.some((it) => it.options.length === 0)
    ) {
      mesApi.error(
        "Please choose at least one option or delete variation empty!"
      );
      return;
    }
    const data: any = {
      subProducts: subProducts.map((item) => {
        return {
          old_options: item.key_combi.split("-"),
          price: Number(item.price),
          stock: Number(item.stock),
          sub_product_id: item.sub_product_id,
        };
      }),
    };

    const arr = [...listVariationOptionChoosed];

    const combinations: any = [];

    const Try = (arr: any[] = [], idx: number, option: any) => {
      for (let i = idx; i < arr.length; i++) {
        const options = [...arr[i].options];
        const ans = [...option];
        for (let j = 0; j < options.length; j++) {
          const item = { ...options[j] };
          ans.push(item);
          /*
              option -> 
              {
                label: string,
                value: string
              }
            */
          if (idx === arr.length - 1 && ans.length === arr.length) {
            combinations.push([...ans]);
          }
          Try(arr, i + 1, ans);
          ans.pop();
        }
      }
    };

    Try(arr, 0, []);

    data.combinations = [...combinations];
    data.lengthChoosed = listVariationOptionChoosed.length;

    console.log(data);

    try {
      const api = `/products/edit-sub-product/${product_id}`;
      await handleAPI(api, data, "patch");
      if (product_id) {
        await getProductDetail(product_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {contextHolderMes}
      <div className="h-full w-full relative pb-10">
        {(isLoading || !productDetail) && (
          <>
            <Loading type="screen" />
          </>
        )}
        <h3 className="mb-3 text-2xl font-semibold">Edit Product</h3>
        <Form
          name="Edit-product"
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
                <Form.Item label="Price" name={"price"} rules={rules}>
                  <InputNumber
                    type="number"
                    placeholder="Enter price"
                    style={{
                      width: "100%",
                    }}
                  />
                </Form.Item>
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
                initialValue={
                  productDetail
                    ? productDetail.content
                    : "<p>This is the initial content.</p>"
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
            <div className="flex-1 mt-4 flex flex-col gap-3">
              <Card size="small">
                <Space>
                  <Button size="middle">Cancel</Button>
                  <Button
                    size="middle"
                    type="primary"
                    onClick={() => form.submit()}
                  >
                    Save Product
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
                            const item = {
                              key: value,
                              select: data.map((it: any) => {
                                return {
                                  label: it.title,
                                  value: it._id,
                                };
                              }),
                            };

                            setListVariationChoosed([
                              ...listVariationChoosed,
                              item,
                            ]);
                          }
                        }}
                      />
                    </div>
                  </div>
                }
              >
                {
                  <div className="flex flex-col gap-2">
                    {listVariationChoosed.map((item) => (
                      <div key={item.key} className="flex gap-4 items-center">
                        <div className="rounded border py-1 px-2 border-[#ddd] w-2/12 text-center">
                          {findItem(variations, item.key).title || ""}
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
                              onChange={(_val, option) => {
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
                              value={listVariationOptionChoosed
                                .find((it) => it?.key_variation === item.key)
                                ?.options.map((el: any) => el.value)}
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
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
                {listVariationChoosed && listVariationChoosed.length > 0 && (
                  <div className="text-right mt-4">
                    <Button
                      size="middle"
                      type="primary"
                      onClick={handleSaveSubProduct}
                    >
                      Save Variation
                    </Button>
                  </div>
                )}
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

                          // const key_combi = item
                          //   .map((it: any) => it.value)
                          //   .join("-");

                          const sub_product_id = item[0].sub_product_id;

                          const it = subProducts.find(
                            (el) => el.sub_product_id === sub_product_id
                          );

                          return {
                            key: index,
                            label: <p className="font-medium">{label}</p>,
                            children: (
                              <div>
                                <Card style={{ borderRadius: 0 }}>
                                  <div className="mb-2">image and SKU</div>
                                  <div className="flex gap-3 w-full">
                                    <div className="w-full">
                                      <label>Price: </label>
                                      <Input
                                        value={it?.price}
                                        placeholder="Enter Price"
                                        name="price"
                                        onChange={(e) => {
                                          const { name, value } = e.target;
                                          const items = [...subProducts];
                                          const idx = items.findIndex(
                                            (el) =>
                                              el.sub_product_id ===
                                              sub_product_id
                                          );
                                          if (idx !== -1) {
                                            items[idx][name] = value;
                                            setSubProducts(items);
                                          }
                                        }}
                                        type="number"
                                      />
                                    </div>
                                    <div className="w-full">
                                      <label>Stock: </label>
                                      <Input
                                        value={it?.stock}
                                        placeholder="Enter Stock"
                                        name="stock"
                                        type="number"
                                        min={0}
                                        onChange={(e) => {
                                          const { name, value } = e.target;
                                          const items = [...subProducts];
                                          const idx = items.findIndex(
                                            (el) =>
                                              el.sub_product_id ===
                                              sub_product_id
                                          );
                                          if (idx !== -1) {
                                            items[idx][name] = value;
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
    </>
  );
};

export default UpdateProduct;
