import type { SizeType } from "antd/es/config-provider/SizeContext";
import type { FormLayout } from "antd/es/form/Form";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FormModel {
  nameForm: string;
  size: SizeType;
  labelCol: number;
  layout: FormLayout;
  title: string;
  formItems: FormItem[];
}

export interface FormItem {
  key: string;
  value: string;
  label: string;
  rule?: Rule;
  placeholder?: string;
  type: "defaut" | "select" | "checkbox";
  typeInput?: "text" | "email" | "password" | "number";
  look_items?: SelectModel[];
}

export interface Rule {
  required: boolean;
  message: string;
}

export interface SelectModel {
  label: string;
  value: string;
  disabled?: boolean;
}
export interface TreeSelectModel {
  title: string;
  value: string;
  children?: any[];
  disabled?: boolean;
}
