/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Checkbox, Collapse, Modal } from "antd";
import type { ProductModel, SubProductModel } from "../../models/productModel";
import { useEffect, useState } from "react";
import type { MessageInstance } from "antd/es/message/interface";
import { handleAPI } from "../../apis/request";
import FormPurchaseOrder from "../../pages/purchase-order/FormPurchaseOrder";

interface Props {
  open: boolean;
  onClose: () => void;
  product?: ProductModel;
  subProducts?: SubProductModel[];
  sampleSubProductVariation?: any[];
  messApi?: MessageInstance;
}

const ModalPuchaseOrder = (props: Props) => {
  const {
    open,
    onClose,
    product,
    subProducts,
    sampleSubProductVariation,
    messApi,
  } = props;

  const [sub_products, setSub_products] = useState<SubProductModel[]>();
  const [sample_sub_products, setSample_sub_products] = useState<any[]>();
  const [dataProducts, setDataProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product?.productType === "variations") {
      if (subProducts && sampleSubProductVariation) {
        if (open) {
          setSub_products(subProducts);
          setSample_sub_products(sampleSubProductVariation);

          const items = subProducts.map((sub) => {
            return {
              ref_id: sub.sub_product_id || sub._id,
              SKU: sub.SKU || "",
              checked: false,
            };
          });
          setDataProducts(items);
        }
      } else {
        //fetch sub products from API if not provided
      }
    } else {
      const items = [
        {
          SKU: product?.SKU || "",
          ref_id: product?._id || "",
          unitCost: "",
          quantity: "",
          checked: true,
        },
      ];
      setDataProducts(items);
    }
  }, [subProducts, sampleSubProductVariation, open, product]);

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

  const handleSubmit = async () => {
    if (!product) return;
    try {
      if (
        dataProducts.length === 0 ||
        dataProducts.every((item) => !item.checked)
      ) {
        messApi?.error("Please select at least one product to order.");
        return;
      }

      if (
        dataProducts.some(
          (item) =>
            (item.unitCost === undefined ||
              item.unitCost === null ||
              item.unitCost === "" ||
              item.quantity === undefined ||
              item.quantity === null ||
              item.quantity === "") &&
            item.checked
        )
      ) {
        messApi?.error(
          "Please fill in all required fields for the selected products."
        );
        return;
      }
      setLoading(true);

      const products = dataProducts
        .filter((item) => item.checked)
        .map((item) => {
          return {
            ref_id: item.ref_id,
            SKU: item.SKU,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
          };
        });

      const payload = {
        products: products,
        supplier_id: product.supplier_id,
        typePurchase: "regular",
        expectedDelivery: new Date(
          new Date().getTime() + 5 * 24 * 60 * 60 * 1000
        ),
      };

      const api = `/purchase-orders/create`;
      const response: any = await handleAPI(api, payload, "post");
      messApi?.success(
        response.message || "Purchase order created successfully."
      );
      onClose();
    } catch (error: any) {
      messApi?.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSimpleProduct = (product: ProductModel) => {
    if (!product) return <></>;
    return (
      <FormPurchaseOrder
        item={product as SubProductModel}
        data={dataProducts}
        SKU={product.SKU}
        id={product._id}
        handleChangeValue={handleChangeValue}
      />
    );
  };

  const renderVariationProduct = (product: ProductModel) => {
    if (!product || !sub_products || !sample_sub_products) return <></>;
    return (
      <div>
        <div className="mb-4">
          This product has variations, please check (tick) products you want
          order.
        </div>
        <Collapse
          bordered={false}
          style={{ background: "white" }}
          size="small"
          items={sample_sub_products.map((sub, index) => {
            const label = sub.map((it: any) => it.label).join(" - ");
            const sub_product = sub_products.find(
              (item) =>
                item.SKU === sub[0].SKU ||
                item.sub_product_id === sub[0].sub_product_id
            );

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
                        sub_product?.SKU || sub_product?.sub_product_id || "",
                        "checked",
                        e.target.checked
                      );
                    }}
                    checked={
                      dataProducts.find(
                        (item) =>
                          item.SKU === sub_product?.SKU ||
                          item.ref_id === sub_product?.sub_product_id
                      )?.checked || false
                    }
                  />
                </>
              ),
              children: (
                <div>
                  <Card style={{ borderRadius: 0 }}>
                    <FormPurchaseOrder
                      item={sub_product as SubProductModel}
                      data={dataProducts}
                      SKU={sub_product?.SKU}
                      id={sub_product?.sub_product_id}
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
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Purchase Order"
      width={800}
      onOk={handleSubmit}
      okButtonProps={{ loading: loading }}
    >
      {product?.productType === "simple"
        ? renderSimpleProduct(product)
        : renderVariationProduct(product as ProductModel)}
    </Modal>
  );
};

export default ModalPuchaseOrder;
