import type { DefaultOptionType } from "antd/es/select";
import type { SelectModel } from "./formModel";

export interface VariationModel {
  _id: string;
  title: string;
  key: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VariationOptionModel {
  _id: string;
  title: string;
  key: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VariationChoosedModel {
  key: string;
  select?: SelectModel[];
}
export interface VariationOptionChoosedModel {
  key_variation: string;
  title?: string;
  options?: SelectModel[] | DefaultOptionType;
}
