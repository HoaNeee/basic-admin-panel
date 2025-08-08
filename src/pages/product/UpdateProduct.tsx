/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Space,
  theme,
  TreeSelect,
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
import type {
  VariationChoosedModel,
  VariationModel,
  VariationOptionChoosedModel,
} from "../../models/variationModel";
import { TiDelete } from "react-icons/ti";
import { BiSolidPlusSquare } from "react-icons/bi";
import { useNavigate, useParams } from "react-router";
import type { ProductModel, SubProductModel } from "../../models/productModel";
import { genCombinations } from "../../helpers/genCombinations";
import ModalVariationOption from "../../components/modals/ModalVariationOption";
import UploadImagePreview from "../../components/UploadImagePreview";
import UploadImage from "../../components/UploadImage";
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import ModalPuchaseOrder from "../../components/modals/ModalPuchaseOrder";

interface SelectEdit extends SelectModel {
  sub_product_id?: string;
}

const UpdateProduct = () => {
  const [suppliers, setSuppliers] = useState<SelectModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
    [SelectEdit][]
  >([]);

  const [subProducts, setSubProducts] = useState<SubProductModel[]>([]);
  const [productDetail, setProductDetail] = useState<ProductModel>();
  const [thumbnail, setThumbnail] = useState<any>();
  const [albumProduct, setAlbumProduct] = useState<any[]>();
  const [oldThumbnail, setOldThumbnail] = useState<any>();
  const [openModalAddVariationOption, setOpenModalAddVariationOption] =
    useState(false);
  const [variationSelected, setVariationSelected] = useState<VariationModel>();
  const [showModalPuchaseOrder, setShowModalPuchaseOrder] = useState(false);

  const [mesApi, contextHolderMes] = message.useMessage();
  const [form] = Form.useForm();
  const editorRef = useRef<any>(null);
  const { token } = theme.useToken();
  const params = useParams();
  const product_id = params.id;
  const setting = useSelector((state: RootState) => state.setting.setting);

  const navigate = useNavigate();

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

    data.stock = values.stock || 0;

    data.content = content;
    data.productType = productType;

    try {
      setIsUpdating(true);
      if (oldThumbnail) {
        data.thumbnail = oldThumbnail;
      } else {
        if (thumbnail) {
          const res = await uploadImage("thumbnail", thumbnail);
          data.thumbnail = res.data;
        } else {
          data.thumbnail = "";
        }
      }

      const images = [];
      const needPushImage = [];

      for (const item of albumProduct || []) {
        if (item?.url) {
          images.push(item.url);
        } else {
          needPushImage.push(item.originFileObj);
        }
      }

      if (needPushImage.length > 0) {
        const res = await uploadImageMulti("images", needPushImage);
        for (const url of res.data) {
          images.push(url);
        }
      }

      data.images = images;

      const api = `/products/edit/${product_id}`;

      await handleSaveSubProduct("product");

      const response: any = await handleAPI(api, data, "patch");
      await getProductDetail(response.data.product_id);
      mesApi.success(response.message);
    } catch (error: any) {
      console.log(error);
      mesApi.error(error.message);
    } finally {
      setIsUpdating(false);
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
    const data = response.data.map((item: CategoryModel) => {
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

  const getProductDetail = async (product_id: string) => {
    const api = `/products/detail/${product_id}`;

    const response: any = await handleAPI(api);

    const dataSubProducts = [...response.dataSubProducts];
    const dataVariationOptions = [...response.dataVariationOptions];

    form.setFieldsValue(response.data);
    setProductType(response.data.productType);
    setOldThumbnail(response.data?.thumbnail || "");
    const images = response.data?.images || [];
    setAlbumProduct(
      images.map((item: any) => {
        return {
          url: item,
        };
      })
    );

    const dataVariationIds = dataVariationOptions.map((item: any) => item._id);
    setProductDetail({
      ...response.data,
      variation_ids: dataVariationIds,
    });

    const items = [];
    for (const item of dataVariationIds) {
      const options = await getVariationOptions(item);
      items.push({
        key: item,
        select: options.map((item: any) => {
          return {
            label: item.title,
            value: item._id,
          };
        }),
      });
    }
    setListVariationChoosed(items);

    setListVariationOptionChoosed(
      dataVariationOptions.map((item: any) => {
        return {
          ...item,
          key_variation: item._id,
        };
      })
    );

    const data = [...dataSubProducts];

    setSampleSubProductVariation(data.map((item: any) => item.options));

    const sampleSubs = data.map((item) => {
      return {
        key_combi: item?.options?.map((it: any) => it.value).join("-"),
        price: item?.price,
        stock: item?.stock,
        sub_product_id: item._id,
        discountedPrice: item?.discountedPrice,
        thumbnail: item?.thumbnail || "",
        SKU: item?.SKU,
        cost: item?.cost,
      };
    });

    setSubProducts(sampleSubs);
  };

  const handleSaveSubProduct = async (
    action: "product" | "sub-product" = "sub-product"
  ) => {
    try {
      if (
        listVariationChoosed.length !== listVariationOptionChoosed.length ||
        listVariationOptionChoosed.some((it) => it.options?.length === 0)
      ) {
        const error =
          "Please choose at least one option or delete variation empty!";
        if (action === "product") {
          throw Error(error);
        } else {
          mesApi.error(error);
        }
        return;
      }

      setIsUpdating(true);

      const items = [...subProducts];

      for (const item of items) {
        if (!item.thumbnail) {
          item.thumbnail = "";
        } else if (typeof item.thumbnail !== "string") {
          const res = await uploadImage("thumbnail", item?.thumbnail);
          item.thumbnail = res.data;
        }
      }

      const data: any = {
        subProducts: items.map((item) => {
          return {
            old_options: item.key_combi?.split("-"),
            price: Number(item.price),
            stock: Number(item.stock),
            sub_product_id: item.sub_product_id,
            thumbnail: item?.thumbnail || "",
            discountedPrice: item?.discountedPrice,
            SKU: item.SKU,
          };
        }),
      };

      const arr = [...listVariationOptionChoosed];

      const combinations: any = genCombinations(arr);

      data.combinations = [...combinations];

      const api = `/products/edit-sub-product/${product_id}`;
      const response: any = await handleAPI(api, data, "patch");

      if (action === "sub-product") {
        mesApi.success(response.message);
      }

      if (product_id) {
        await getProductDetail(product_id);
      }
    } catch (error: any) {
      if (action === "sub-product") {
        mesApi.error(error.message);
      } else throw Error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeImage: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setAlbumProduct(newFileList);
  };

  const hideModalVariationOption = () => {
    setOpenModalAddVariationOption(false);
    setVariationSelected(undefined);
  };

  const handleDeleteSubProduct = async (sub_product_id: string) => {
    const api = `/products/delete/sub-product/${sub_product_id}`;
    try {
      setIsUpdating(true);
      const response: any = await handleAPI(api, undefined, "delete");
      mesApi.success(response.message);
      await getProductDetail(product_id || "");
    } catch (error: any) {
      mesApi.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderThumbnail = () => {
    return (
      <UploadImage
        file={
          (thumbnail || oldThumbnail) && thumbnail
            ? URL.createObjectURL(thumbnail)
            : oldThumbnail
            ? oldThumbnail
            : undefined
        }
        onChange={(e) => {
          if (e.target.files) {
            setThumbnail(e.target.files[0]);
          }
        }}
        onDelete={() => {
          if (oldThumbnail) {
            setOldThumbnail(undefined);
          } else if (thumbnail) {
            setThumbnail(undefined);
          }
        }}
      />
    );
  };
  const hideModalCategory = () => {
    setOpenModalAddCategory(false);
  };

  const hideModalPurchaseOrder = () => {
    setShowModalPuchaseOrder(false);
  };

  return (
    <>
      {contextHolderMes}
      <div className="h-full w-full relative p-3 pb-8">
        {(isUpdating || isLoading || !productDetail) && (
          <Loading type="superScreen" />
        )}
        <div className="flex items-center justify-between mb-5 rounded-md shadow-sm py-4 px-6 bg-white">
          <h3 className="text-2xl font-semibold">Edit Product</h3>
          <Space wrap={true}>
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => setShowModalPuchaseOrder(true)}
            >
              Order quantity
            </Button>
            <a
              target="_blank"
              href={`https://${
                setting.subdomain.find((item) => item === "shop") || "shop"
              }.${setting?.domain}/shop/${productDetail?.slug}`}
            >
              <Button icon={<EyeOutlined />} onClick={() => {}}>
                Preview
              </Button>
            </a>
          </Space>
        </div>

        <Form
          name="Edit-product"
          onFinish={handleFinish}
          form={form}
          layout="vertical"
          size="large"
        >
          <div className="w-full h-full flex gap-5 md:flex-row flex-col">
            <div className="md:w-3/5 w-full">
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
                  <Form.Item label="Cost" name={"cost"} className="w-full">
                    <Input placeholder="Enter Cost" style={{ width: "100%" }} />
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

              <div className="flex gap-2">
                <Form.Item label="SKU" name={"SKU"} className="w-full">
                  <Input placeholder="Enter SKU" style={{ width: "100%" }} />
                </Form.Item>
              </div>

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
                  <Button size="middle" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
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
              <Card title="Thumbail" size="small">
                {renderThumbnail()}
              </Card>
              <Card title="Ablum" size="small">
                <UploadImagePreview
                  fileList={albumProduct}
                  multiple
                  onChange={handleChangeImage}
                />
              </Card>
            </div>
          </div>
          {productType === "variations" && (
            <div className="mt-3 flex flex-col gap-3">
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
                          {findItem(variations, item?.key)?.title || ""}
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
                              value={listVariationOptionChoosed
                                .find((it) => it?.key_variation === item.key)
                                ?.options?.map((el: any) => el.value)}
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
                }
                <div className="flex flex-col gap-2 mt-4 justify-end items-end">
                  <p>Note when updating variations, your data may be lost</p>
                  <div className="text-right mt-4">
                    <Button
                      size="middle"
                      type="primary"
                      onClick={() => handleSaveSubProduct("sub-product")}
                    >
                      Save Variation
                    </Button>
                  </div>
                </div>
              </Card>
              <Card>
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
                            ?.map((it: any) => it.label)
                            .join(" - ");

                          const key_combi = item
                            ?.map((it: any) => it.value)
                            .join("-");

                          const sub_product_id =
                            item && item?.length > 0 && item[0]?.sub_product_id;

                          const it = subProducts.find(
                            (el) => el?.key_combi === key_combi
                          );

                          let file: any = {
                            uid: "thumbnail_" + Date.now(),
                            name: it?.thumbnail || "",
                            url: it?.thumbnail || "",
                          };

                          if (!it?.thumbnail || !file.url) {
                            file = undefined;
                          }

                          return {
                            key: index,
                            label: <p className="font-medium">{label}</p>,
                            extra: (
                              <>
                                <Popconfirm
                                  onCancel={(e) => {
                                    e?.stopPropagation();
                                  }}
                                  onConfirm={(e) => {
                                    e?.stopPropagation();
                                    handleDeleteSubProduct(
                                      sub_product_id || ""
                                    );
                                  }}
                                  title="Are you sure?"
                                >
                                  <Button
                                    size="small"
                                    type="link"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    style={{ color: "red", fontSize: 12 }}
                                  >
                                    Remove
                                  </Button>
                                </Popconfirm>
                              </>
                            ),
                            children: (
                              <div>
                                <Card style={{ borderRadius: 0 }}>
                                  <div className="flex items-center justify-between md:flex-row flex-col gap-2">
                                    <UploadImagePreview
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
                                      maxCount={1}
                                      multiple
                                      defaultFileList={
                                        file ? [file] : undefined
                                      }
                                    />

                                    <div className="md:w-3/5 flex flex-col gap-2">
                                      <div className="w-full flex flex-col gap-1">
                                        <label className="text-sm">SKU: </label>
                                        <Input
                                          size="middle"
                                          value={it?.SKU}
                                          placeholder="Enter SKU"
                                          name="SKU"
                                          onChange={(e) => {
                                            const { value } = e.target;
                                            const items = [...subProducts];
                                            const idx = items.findIndex(
                                              (el) => el.key_combi === key_combi
                                            );
                                            if (idx !== -1) {
                                              items[idx]["SKU"] = value;
                                              setSubProducts(items);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="w-full flex items-center gap-3 md:flex-row flex-col">
                                        <div className="flex flex-col w-full gap-1">
                                          <label className="text-sm">
                                            Stock:{" "}
                                          </label>
                                          <Input
                                            size="middle"
                                            value={it?.stock}
                                            placeholder="Enter stock"
                                            name="stock"
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              const items = [...subProducts];
                                              const idx = items.findIndex(
                                                (el) =>
                                                  el.key_combi === key_combi
                                              );
                                              if (idx !== -1) {
                                                items[idx]["stock"] =
                                                  Number(value);
                                                setSubProducts(items);
                                              }
                                            }}
                                          />
                                        </div>
                                        <div className="flex flex-col w-full">
                                          <label className="text-sm">
                                            Cost:{" "}
                                          </label>
                                          <Input
                                            size="middle"
                                            value={it?.cost}
                                            placeholder="Enter Cost"
                                            name="cost"
                                            onChange={(e) => {
                                              const { value } = e.target;
                                              const items = [...subProducts];
                                              const idx = items.findIndex(
                                                (el) =>
                                                  el.key_combi === key_combi
                                              );
                                              if (idx !== -1) {
                                                items[idx]["cost"] = value;
                                                setSubProducts(items);
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 w-full mt-6 md:flex-row flex-col">
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
                                            items[idx]["price"] = Number(value);
                                            setSubProducts(items);
                                          }
                                        }}
                                        type="number"
                                      />
                                    </div>
                                    <div className="w-full">
                                      <label>Discounted price: </label>
                                      <Input
                                        value={it?.discountedPrice}
                                        placeholder="Enter discounted price"
                                        name="discountedPrice"
                                        type="number"
                                        min={0}
                                        onChange={(e) => {
                                          const { value } = e.target;
                                          const items = [...subProducts];
                                          const idx = items.findIndex(
                                            (el) => el?.key_combi === key_combi
                                          );
                                          if (idx !== -1) {
                                            items[idx]["discountedPrice"] =
                                              Number(value);
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
      <ModalPuchaseOrder
        open={showModalPuchaseOrder}
        onClose={hideModalPurchaseOrder}
        product={productDetail}
        subProducts={subProducts}
        sampleSubProductVariation={sampleSubProductVariation}
        messApi={mesApi}
      />
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

export default UpdateProduct;
