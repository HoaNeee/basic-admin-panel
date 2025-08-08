/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input } from "antd";
import type { ProductModel, SubProductModel } from "../../models/productModel";

interface Props {
  item?: SubProductModel | ProductModel;
  data: any[];
  SKU?: string;
  id?: string;
  handleChangeValue: (
    data: any,
    SKU: string,
    key: string,
    value: string | number,
    id?: string
  ) => void;
}

const FormPurchaseOrder = (props: Props) => {
  const { item, data, SKU, id, handleChangeValue } = props;
  if (!item) return <></>;
  return (
    <div className="w-full h-full">
      <div className="flex gap-2 items-center md:flex-row flex-col">
        <div className="flex flex-col gap-1 w-full">
          <label>SKU</label>
          <Input name="SKU" disabled defaultValue={item?.SKU} size="middle" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label>Price Selling</label>
          <Input
            name="currentPrice"
            disabled
            defaultValue={item?.price}
            size="middle"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center md:flex-row flex-col mt-4">
        <div className="flex flex-col gap-1 w-full">
          <label>Last Unit Cost</label>
          <Input
            name="lastUnitCost"
            disabled
            defaultValue={item?.cost || 0}
            size="middle"
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label>Remaining Stock</label>
          <Input
            name="currentStock"
            disabled
            defaultValue={item?.stock || 0}
            size="middle"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <div className="flex flex-col gap-1 w-full">
          <label>Unit Cost</label>
          <Input
            name="unitCost"
            required
            placeholder="Enter Unit Cost"
            onChange={(e) =>
              handleChangeValue(data, SKU || "", "unitCost", e.target.value)
            }
            type="number"
            min={0}
            value={
              data.find((item) => item?.SKU === SKU || item?.ref_id === id)
                ?.unitCost || ""
            }
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label>Quantity</label>
          <Input
            name="quantity"
            required
            placeholder="Enter Quantity"
            type="number"
            min={0}
            onChange={(e) =>
              handleChangeValue(data, SKU || "", "quantity", e.target.value)
            }
            value={
              data.find((item) => item?.SKU === SKU || item?.ref_id === id)
                ?.quantity || ""
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FormPurchaseOrder;
