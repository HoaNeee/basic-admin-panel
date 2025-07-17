/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox, Form, Input, Select, type FormInstance } from "antd";
import type { FormItem, FormModel } from "../models/formModel";

interface Props {
  formData?: FormModel;
  form: FormInstance;
  onFinish: (val: any) => Promise<void>;
  isTaking?: boolean;
  setIsTaking?: any;
}

const MyForm = (props: Props) => {
  const { formData, form, onFinish, isTaking, setIsTaking } = props;

  const renderChildren = (item: FormItem) => {
    switch (item.type) {
      case "checkbox":
        return (
          <Checkbox
            checked={isTaking}
            onChange={() => {
              setIsTaking(!isTaking);
            }}
          >
            {isTaking ? "Taking" : "No Taking"}
          </Checkbox>
        );

      case "select":
        return (
          <Select
            options={item.look_items}
            placeholder={"Updating..."}
            disabled={item.key === "product" || item.key === "category"}
          />
        );

      default:
        return (
          <Input
            type={item.typeInput || "text"}
            placeholder={
              item.key === "product" ? "Updating..." : item.placeholder
            }
            name={item.key}
            disabled={item.key === "product" || item.key === "category"}
          />
        );
    }
  };

  return (
    formData && (
      <Form
        name={formData?.nameForm}
        onFinish={onFinish}
        size={formData?.size}
        labelCol={{ span: formData?.labelCol }}
        form={form}
        autoComplete="on"
        layout={formData?.layout}
        title={formData.title}
      >
        {formData?.formItems &&
          formData.formItems.map((item, index) => (
            <Form.Item
              key={index}
              label={item.label}
              name={item.key}
              rules={[
                {
                  required: item.rule?.required,
                  message: item.rule?.message,
                },
              ]}
            >
              {renderChildren(item)}
            </Form.Item>
          ))}
      </Form>
    )
  );
};

export default MyForm;
