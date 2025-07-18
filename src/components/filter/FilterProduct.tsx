/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Select, Slider, Space } from "antd";
import { Form } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import Loading from "../Loading";
import type { SelectModel } from "../../models/formModel";
import type { CategoryModel } from "../../models/categoryModel";

interface FilterValue {
  categories?: CategoryModel[];
  price?: {
    min: number;
    max: number;
  };
  productType?: "simple" | "variations";
}

interface Props {
  values?: FilterValue;
  onFilter?: (value: FilterValue) => void;
  mesApi?: MessageInstance;
  onClear?: () => void;
}

const FilterProduct = (props: Props) => {
  const { values, onFilter, mesApi, onClear } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [valueSelect, setValueSelect] = useState<{
    categories?: SelectModel[];
    productType?: "simple" | "variations";
    price?: {
      min: number;
      max: number;
    };
  }>();

  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, []);

  // const handleChangeValue = (values: any, key: string) => {
  //   const item: any = { ...valueSelect };
  //   item[`${key}`] = values;
  //   console.log(item);
  //   setValueSelect({ ...valueSelect, ...item });
  // };

  const getData = async () => {
    try {
      setIsLoading(true);
      const price = await getPriceProduct();
      const item: any = {};
      item.price = price;
      if (values?.categories) {
        item.categories = values.categories.map((it: CategoryModel) => {
          return {
            label: it.title,
            value: it._id,
          };
        });
      }
      setValueSelect({
        ...valueSelect,
        ...item,
      });
    } catch (error: any) {
      console.log(error);
      mesApi?.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceProduct = async () => {
    const api = `/products/get-price`;
    const response = await handleAPI(api);
    return response.data;
  };

  const handleSubmit = (values: any) => {
    if (onFilter) {
      onFilter(values);
    }
  };

  return (
    <div className="bg-white w-72 p-5 dropdown-filter relative rounded-lg">
      {isLoading && <Loading type="screen" />}
      <Form name="filter" form={form} onFinish={handleSubmit}>
        <Form.Item name={"categories"} label="Category">
          <Select
            options={valueSelect?.categories}
            placeholder="Categories"
            mode="tags"
          />
        </Form.Item>
        <Form.Item name={"productType"} label="Product Type">
          <Select
            options={[
              {
                value: "variations",
                label: "Variations",
              },
              {
                value: "simple",
                label: "Simple",
              },
            ]}
            placeholder="Product Type"
            allowClear
          />
        </Form.Item>

        <Form.Item name={"price"} label="Price">
          <Slider
            min={valueSelect?.price?.min}
            max={valueSelect?.price?.max}
            range
          />
        </Form.Item>
      </Form>
      <div className="text-right">
        <Space className="text-right">
          <Button
            onClick={() => {
              form.resetFields();
              if (onClear) {
                onClear();
              }
            }}
          >
            Clear
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            Done
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default FilterProduct;
