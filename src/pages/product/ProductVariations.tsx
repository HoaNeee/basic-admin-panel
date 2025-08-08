/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  Form,
  Input,
  Popconfirm,
  Select,
  theme,
} from "antd";
import type {
  VariationChoosedModel,
  VariationModel,
  VariationOptionChoosedModel,
} from "../../models/variationModel";
import { TiDelete } from "react-icons/ti";
import { BiSolidPlusSquare } from "react-icons/bi";
import type { SelectModel } from "../../models/formModel";
import UploadImagePreview from "../../components/UploadImagePreview";
import { useEffect, useState } from "react";
import type { MessageInstance } from "antd/es/message/interface";
import { genCombinations } from "../../helpers/genCombinations";
import type { SubProductModel } from "../../models/productModel";
import { handleAPI } from "../../apis/request";
import ModalVariationOption from "../../components/modals/ModalVariationOption";

interface Props {
  message: MessageInstance;
  variations: VariationModel[];
  setIsLoading: (isLoading: boolean) => void;
  dataSelectVariation: SelectModel[];
  setDataSelectVariation: (data: SelectModel[]) => void;
  subProducts: SubProductModel[];
  setSubProducts: (data: SubProductModel[]) => void;
  dataGenarateVariations?: any;
}

const ProductVariations = (props: Props) => {
  const {
    message,
    variations,
    setIsLoading,
    dataSelectVariation,
    setDataSelectVariation,
    subProducts,
    setSubProducts,
    dataGenarateVariations,
  } = props;

  const [listVariationChoosed, setListVariationChoosed] = useState<
    VariationChoosedModel[]
  >([]);

  const [listVariationOptionChoosed, setListVariationOptionChoosed] = useState<
    VariationOptionChoosedModel[]
  >([]);

  const [sampleSubProductVariation, setSampleSubProductVariation] = useState<
    [SelectModel][]
  >([]);

  const [variationSelected, setVariationSelected] = useState<VariationModel>();
  const [openModalAddVariationOption, setOpenModalAddVariationOption] =
    useState(false);

  const { token } = theme.useToken();

  useEffect(() => {
    const items = [...(dataSelectVariation || [])];

    for (const item of items) {
      const exist = listVariationChoosed.find((it) => it.key === item.value);
      if (exist) {
        item.disabled = true;
      } else item.disabled = false;
    }

    setDataSelectVariation?.(items);
  }, [listVariationChoosed]);

  useEffect(() => {
    const solve = async () => {
      const { variation_ids, sub_products, option_ids } =
        dataGenarateVariations;

      if (sub_products && sub_products.length > 0) {
        const subs = sub_products.map((sub: any) => {
          const keys = sub?.key_combi
            ?.split("-")
            .sort((a: string, b: string) => a.localeCompare(b))
            .join("-");
          return {
            ...sub,
            key_combi: keys,
          };
        });
        setSubProducts(subs);
      }

      const options = [];

      if (variation_ids && variation_ids.length > 0) {
        for (const variation_id of variation_ids || []) {
          const data = await getVariationOptions(variation_id);
          options.push(data);
          setListVariationChoosed((prev) => {
            return [
              ...prev,
              {
                key: variation_id,
                select: data.map((item: any) => {
                  return {
                    label: item.title,
                    value: item._id,
                  };
                }),
              },
            ];
          });
        }
      }

      if (option_ids && option_ids.length > 0) {
        const flat_options = options.flat();

        const items: VariationOptionChoosedModel[] = [];
        for (const option_id of option_ids || []) {
          const option = flat_options.find((it) => it._id === option_id);
          if (option) {
            if (items.length === 0) {
              items.push({
                key_variation: option.variation_id,
                title: option.title,
                options: [
                  {
                    label: option.title,
                    value: option._id,
                  },
                ],
              });
              continue;
            }
            const index_variations = items.findIndex(
              (it) => it.key_variation === option.variation_id
            );
            if (index_variations !== -1) {
              items[index_variations]?.options?.push({
                label: option.title,
                value: option._id,
              });
            } else {
              items.push({
                key_variation: option.variation_id,
                title: option.title,
                options: [
                  {
                    label: option.title,
                    value: option._id,
                  },
                ],
              });
            }
          }
        }

        const combinations = genCombinations([...items]);
        setSampleSubProductVariation(combinations);
        setListVariationOptionChoosed([...items]);
      }
    };
    if (dataGenarateVariations) {
      console.log(dataGenarateVariations);
      solve();
    }
  }, []);

  const findItem = (data: any[] = [], key: string) => {
    const item = data.find((it) => it._id === key);
    return item;
  };

  const handleCreateSubProduct = () => {
    if (
      listVariationChoosed.length !== listVariationOptionChoosed.length ||
      listVariationOptionChoosed.some((it) => it?.options?.length === 0)
    ) {
      message.error(
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
        createPurchaseOrder: false,
        SKU: "",
        price: undefined,
        stock: undefined,
        cost: undefined,
        thumbnail: "",
        discountedPrice: undefined,
      });
    }

    setSubProducts(items);
    setSampleSubProductVariation([...combinations]);
  };

  const getVariationOptions = async (variation_id: string) => {
    const api = `/variation-options?variation_id=${variation_id}`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);

      return response.data;
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeVariation = async (value: string) => {
    const set = new Set([...listVariationChoosed.map((it) => it.key)]);
    if (set.has(value)) {
      message.error("Already existing option!");
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
  };

  const handleChangeVariationOption = (
    item: VariationChoosedModel,
    option: any
  ) => {
    const items = [...listVariationOptionChoosed];
    const index = items.findIndex((it) => it.key_variation === item.key);

    if (index !== -1) {
      if (option?.length > 0) {
        items[index].options = option;
      } else {
        items.splice(index, 1);
      }
    } else {
      items.push({
        key_variation: item.key,
        title: findItem(variations, item.key)?.title || item.key,
        options: option,
      });
    }
    setListVariationOptionChoosed(items);
  };

  const renderRemoveVariationOption = (key_combi: string) => {
    return (
      <Popconfirm
        onCancel={(e) => {
          e?.stopPropagation();
        }}
        onConfirm={(e) => {
          e?.stopPropagation();
          const sampleMap = new Map();
          for (const item of sampleSubProductVariation) {
            const key_combi = item.map((it: SelectModel) => it.value).join("-");
            sampleMap.set(key_combi, item);
          }

          sampleMap.set(key_combi, null);

          const items: [SelectModel][] = [];
          sampleMap.forEach((val) => {
            if (val) {
              items.push(val);
            }
          });
          setSubProducts(
            subProducts.filter((it) => it.key_combi !== key_combi)
          );
          setSampleSubProductVariation(items);
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
    );
  };

  const handleChangeValueVariationOption = (
    value: any,
    key_combi: string,
    key: string
  ) => {
    console.log(subProducts);
    const items: any = [...subProducts];
    const idx = items.findIndex((el: any) => el.key_combi === key_combi);
    if (idx !== -1) {
      items[idx][key] = value;
      setSubProducts(items);
    }
  };

  const hideModalVariationOption = () => {
    setOpenModalAddVariationOption(false);
    setVariationSelected(undefined);
  };

  return (
    <>
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
                  onChange={(value: string) => handleChangeVariation(value)}
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
                        listVariationChoosed.find((it) => it.key === item.key)
                          ?.select || []
                      }
                      placeholder="Choose options"
                      size="middle"
                      style={{
                        width: "100%",
                      }}
                      mode="tags"
                      onChange={(_val, option: any) =>
                        handleChangeVariationOption(item, option)
                      }
                      value={
                        listVariationOptionChoosed.find(
                          (it) => it.key_variation === item.key
                        )?.options || []
                      }
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

                        const index = listVariationOptionChoosed.findIndex(
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

          <div className="flex justify-end mt-4">
            <div className="flex flex-col gap-2">
              <p>Note when creating variations, your data may be lost</p>
              <div className="text-right">
                <Button
                  size="middle"
                  type="primary"
                  onClick={handleCreateSubProduct}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <Card className="">
          <div className="font-medium">Variations Of Products:</div>
          {sampleSubProductVariation &&
            sampleSubProductVariation.length > 0 && (
              <div className="my-4">
                <Collapse
                  bordered={false}
                  style={{ background: "white" }}
                  size="middle"
                  items={sampleSubProductVariation.map((item, index) => {
                    const label = item.map((it: any) => it.label).join(" - ");

                    const key_combi = item
                      .map((it: any) => it.value)
                      .sort((a, b) => a.localeCompare(b))
                      .join("-");

                    const it = subProducts.find(
                      (el) => el.key_combi === key_combi
                    );

                    return {
                      key: index,
                      extra: renderRemoveVariationOption(key_combi),
                      label: (
                        <div className="">
                          <p className="font-medium">{label}</p>
                        </div>
                      ),
                      children: (
                        <div>
                          <Card style={{ borderRadius: 0 }}>
                            <div className="flex justify-between items-center md:flex-row flex-col gap-3">
                              <UploadImagePreview
                                maxCount={1}
                                multiple
                                onChange={(props) =>
                                  handleChangeValueVariationOption(
                                    props.fileList[0]?.originFileObj || "",
                                    key_combi,
                                    "thumbnail"
                                  )
                                }
                                defaultFileList={
                                  it?.thumbnail
                                    ? [
                                        {
                                          uid: "-1",
                                          name: "image.png",
                                          status: "done",
                                          url: it.thumbnail,
                                          originFileObj: it.thumbnail,
                                        },
                                      ]
                                    : []
                                }
                              />
                              <div className="md:w-3/5 flex flex-col gap-2">
                                <div className="w-full">
                                  <label className="text-sm">SKU: </label>
                                  <Input
                                    size="middle"
                                    value={it?.SKU}
                                    placeholder="Enter SKU"
                                    name="SKU"
                                    onChange={(e) =>
                                      handleChangeValueVariationOption(
                                        e.target.value,
                                        key_combi,
                                        "SKU"
                                      )
                                    }
                                  />
                                </div>
                                <div className="w-full flex items-center gap-3 md:flex-row flex-col">
                                  <div className="flex flex-col gap-0 w-full">
                                    <label className="text-sm">Stock: </label>
                                    <Input
                                      size="middle"
                                      value={it?.stock}
                                      placeholder="Enter stock"
                                      name="stock"
                                      onChange={(e) =>
                                        handleChangeValueVariationOption(
                                          e.target.value,
                                          key_combi,
                                          "stock"
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-0 w-full">
                                    <label className="text-sm">Cost: </label>
                                    <Input
                                      size="middle"
                                      value={it?.cost}
                                      placeholder="Enter cost"
                                      name="cost"
                                      onChange={(e) =>
                                        handleChangeValueVariationOption(
                                          e.target.value,
                                          key_combi,
                                          "cost"
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 md:flex-row flex-col w-full mt-6">
                              <div className="w-full">
                                <label>Price: </label>
                                <Input
                                  value={it?.price}
                                  placeholder="Enter Price"
                                  name="price"
                                  onChange={(e) =>
                                    handleChangeValueVariationOption(
                                      e.target.value,
                                      key_combi,
                                      "price"
                                    )
                                  }
                                  type="number"
                                />
                              </div>
                              <div className="w-full">
                                <label>Discounted Price: </label>
                                <Input
                                  value={it?.discountedPrice}
                                  placeholder="Enter discounted price"
                                  name="discountedPrice"
                                  type="number"
                                  min={0}
                                  onChange={(e) =>
                                    handleChangeValueVariationOption(
                                      e.target.value,
                                      key_combi,
                                      "discountedPrice"
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full mt-4 flex items-center gap-2">
                              <Checkbox
                                id={`create-purchase-order-${key_combi}`}
                                checked={it?.createPurchaseOrder}
                                onChange={(e) =>
                                  handleChangeValueVariationOption(
                                    e.target.checked,
                                    key_combi,
                                    "createPurchaseOrder"
                                  )
                                }
                              />
                              <label
                                htmlFor={`create-purchase-order-${key_combi}`}
                              >
                                Create purchase order for this sub product
                              </label>
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
      <ModalVariationOption
        isOpen={openModalAddVariationOption}
        onClose={hideModalVariationOption}
        mesApi={message}
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

export default ProductVariations;
