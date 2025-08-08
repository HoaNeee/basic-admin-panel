/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Form,
  message,
  Select,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { handleAPI } from "../../apis/request";
import { useEffect, useState } from "react";
import type { SelectModel } from "../../models/formModel";
import type { ProductModel, SubProductModel } from "../../models/productModel";
import type { Supplier } from "../../models/supplier";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router";
import FormPurchaseOrder from "./FormPurchaseOrder";

const AddPurchaseOrder = () => {
  const [listSKU, setListSKU] = useState<SelectModel[]>([]);
  const [listSelected, setListSelected] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<SelectModel[]>();
  const [listProduct, setListProduct] = useState<any[]>([]);
  const [dataProducts, setDataProducts] = useState<any[]>([]);
  const [flagChange, setFlagChange] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form] = useForm();
  const navigate = useNavigate();
  const messApi = message;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await getAllSKU();
        await getSupplier();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAllSKU = async () => {
    try {
      const response = await handleAPI("/products/get-all-sku");
      const data = response.data.map((item: ProductModel) => {
        return {
          label: `${item.title} - ${item.SKU}`,
          value: String(item._id),
        };
      });

      setListSKU(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSupplier = async () => {
    const response = await handleAPI("/suppliers");
    const data = response.data.map((item: Supplier) => {
      return {
        label: item.name,
        value: String(item._id),
      };
    });
    setSuppliers(data);
  };

  const getListProduct = async (ids: string[]) => {
    try {
      setIsLoading(true);
      setFlagChange(false);
      const response = await handleAPI(
        "/products/products-sku",
        { ids },
        "post"
      );
      const products = response.data;

      const items = [];

      for (const item of products) {
        if (item.productType === "simple") {
          items.push({
            checked: true,
            SKU: item.SKU,
            ref_id: item._id,
          });
        } else {
          for (const sub of item.subProducts) {
            items.push({
              SKU: sub.SKU,
              checked: false,
              ref_id: sub._id,
            });
          }
        }
      }
      setDataProducts(items);
      setListProduct(products);
    } catch (error: any) {
      console.log(error);
      messApi.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeValue = (
    data: any,
    SKU: string,
    key: string,
    value: any,
    id?: string
  ) => {
    const items = [...data];

    const index = items.findIndex((it) => it.SKU === SKU || it.ref_id === id);
    if (index !== -1) {
      items[index][key] = value;
    } else {
      items.push({
        SKU: SKU,
        [key]: value,
      });
    }

    setDataProducts(items);
  };

  const handleFinish = async (values: any) => {
    try {
      if (
        dataProducts.some(
          (item) =>
            item.checked &&
            (item.unitCost === undefined ||
              item.quantity === undefined ||
              item.unitCost === "" ||
              item.quantity === "")
        )
      ) {
        throw Error("Can not continue. Please check input field!");
      }
      setIsCreating(true);
      const supplier_id = values.supplier_id;
      const expectedDelivery = new Date(
        values.expectedDelivery.$d
      ).toISOString();

      const payload: any = { supplier_id, expectedDelivery, products: [] };

      for (const item of dataProducts) {
        if (item.checked) {
          item.ref_id = item?.ref_id || item._id;
          item.unitCost = Number(item.unitCost);
          item.quantity = Number(item.quantity);
          payload.products.push(item);
        }
      }

      const response: any = await handleAPI(
        "/purchase-orders/create",
        payload,
        "post"
      );
      messApi.success(response.message);
      navigate("/purchase-orders");
    } catch (error: any) {
      messApi.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card title="New Puchase Order">
        {isLoading && <Loading type="superScreen" />}
        <Form
          name="purchase-order"
          form={form}
          onFinish={handleFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name={"listProduct"}
            label="Products"
            rules={[{ required: true }]}
          >
            <Select
              options={listSKU}
              mode="multiple"
              onClear={() => setFlagChange(true)}
              showSearch
              allowClear
              placeholder="Choose SKU"
              onChange={(e) => {
                setListSelected(e);
                setFlagChange(true);
              }}
              optionFilterProp="label"
            />
          </Form.Item>

          <div className="text-right my-4 flex justify-end items-center gap-2">
            {listProduct.length > 0 && (
              <Button
                size="middle"
                onClick={() => {
                  setListProduct([]);
                  setDataProducts([]);
                }}
              >
                Clear
              </Button>
            )}
            <Button
              size="middle"
              onClick={async () => {
                await getListProduct(listSelected);
              }}
              disabled={listSelected.length <= 0}
            >
              Generate
            </Button>
          </div>

          <div className="my-6">
            <Collapse
              bordered={false}
              style={{ background: "white" }}
              size="middle"
              items={listProduct.map((item, index) => {
                const label = `${item.title} - ${item.SKU}`;

                const subProducts: any[] = item.subProducts;

                return {
                  key: index,
                  label: (
                    <div className="">
                      <p className="font-medium">{label}</p>
                    </div>
                  ),
                  children: (
                    <div>
                      <Card style={{ borderRadius: 0 }}>
                        {item.productType === "simple" ? (
                          <FormPurchaseOrder
                            item={item as ProductModel}
                            data={dataProducts}
                            SKU={item.SKU}
                            id={item._id}
                            handleChangeValue={handleChangeValue}
                          />
                        ) : (
                          <div>
                            <div className="mb-4">
                              This product has variations, please check (tick)
                              products you want order.
                            </div>
                            <Collapse
                              bordered={false}
                              style={{ background: "white" }}
                              size="small"
                              items={subProducts.map((sub, index) => {
                                const label = sub.options.join(" - ");

                                return {
                                  key: index,
                                  label: (
                                    <div className="">
                                      <p className="font-medium">{label}</p>
                                    </div>
                                  ),
                                  extra: (
                                    <>
                                      <Checkbox
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                          handleChangeValue(
                                            dataProducts,
                                            sub.SKU,
                                            "checked",
                                            e.target.checked
                                          );
                                        }}
                                      />
                                    </>
                                  ),
                                  children: (
                                    <div>
                                      <Card style={{ borderRadius: 0 }}>
                                        <FormPurchaseOrder
                                          item={sub as SubProductModel}
                                          data={dataProducts}
                                          SKU={sub.SKU}
                                          id={sub._id}
                                          handleChangeValue={handleChangeValue}
                                        />
                                      </Card>
                                    </div>
                                  ),
                                  style: {
                                    marginBottom: 10,
                                    background: "#f2f2f18a",
                                    border: "none",
                                    padding: 0,
                                    borderRadius: 0,
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
                  ),
                  style: {
                    marginBottom: 10,
                    background: "#f2f2f2",
                    borderRadius: 0,
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

          <Form.Item
            name={"supplier_id"}
            label="Supplier"
            rules={[{ required: true }]}
          >
            <Select
              options={suppliers}
              showSearch
              allowClear
              placeholder="Choose Supplier"
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name={"expectedDelivery"}
            label="Expected Delivery"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
        <div className="text-right space-x-2">
          <Button
            size="large"
            onClick={() => navigate(-1)}
            loading={isCreating}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            disabled={
              listSelected.length <= 0 || dataProducts.length <= 0 || flagChange
            }
            onClick={() => form.submit()}
            loading={isCreating}
          >
            Order
          </Button>
        </div>
      </Card>
    </>
  );
};

export default AddPurchaseOrder;
