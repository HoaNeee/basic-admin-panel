/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  List,
  Modal,
  Select,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import { handleAPI } from "../../apis/request";
import { utils, writeFileXLSX } from "xlsx";
import { appName } from "../../constants/appName";
import type { FormModel } from "../../models/formModel";
import Loading from "../Loading";

const { RangePicker } = DatePicker;

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  total: any;
  data: any[];
  page: any;
}

const ModalExportSupplier = (props: Props) => {
  const { isOpen, closeModal, total, data, page } = props;

  const [formData, setFormData] = useState<FormModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecordExport, setTotalRecordExport] = useState<any>();
  const [timeRange, setTimeRange] = useState<{
    fromDate?: string;
    toDate?: string;
  }>();
  const [optionsExport, setOptionsExport] = useState<{
    select: string[];
    value: number;
    page: number;
    fromDate?: string;
    toDate?: string;
  }>();

  useEffect(() => {
    getForm();
  }, []);

  useEffect(() => {
    if (optionsExport) {
      setOptionsExport({
        ...optionsExport,
        page: page,
        value: data.length,
      });
    }
  }, [data]);

  useEffect(() => {
    if (timeRange?.fromDate && timeRange.toDate) {
      handleGetRecordExport(timeRange);
    } else {
      setTotalRecordExport(null);
    }
  }, [timeRange, optionsExport]);

  const handleGetRecordExport = async (timeRange?: any) => {
    const api = `/suppliers/data-export?start=${timeRange.fromDate}&end=${
      timeRange.toDate
    }&page=${optionsExport?.page || ""}&limit=${optionsExport?.value}`;

    try {
      setIsLoading(true);
      const response = await handleAPI(api);

      setTotalRecordExport(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    let api = `/suppliers/export-excel`;
    if (timeRange && timeRange.fromDate && timeRange.toDate) {
      api += `?start=${timeRange.fromDate}&end=${timeRange.toDate}`;
    }
    try {
      setIsLoading(true);
      const response = await handleAPI(
        api,
        {
          options: optionsExport,
        },
        "post"
      );

      exportToExcel(
        response.data.map((item: any) => {
          delete item._id;
          return item;
        }),
        "suppliers"
      );
      closeModal();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = (data: any, name: string) => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, name);
    writeFileXLSX(
      wb,
      `${appName.appConstantname}-${name}_data-${Date.now()}.xlsx`
    );
  };

  const getForm = async () => {
    const api = `/suppliers/get-form`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setFormData(response.data);
      setOptionsExport({
        select: response.data.formItems.map((item: any) => item.value),
        value: total,
        page: page,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={closeModal}
      title="Export"
      footer={() => {
        return (
          <Flex justify="space-between">
            <Space>
              <Select
                defaultValue={optionsExport?.value}
                value={optionsExport?.value}
                options={[
                  {
                    title: "All",
                    label: "All document",
                    value: total,
                  },
                  {
                    title: "This page",
                    label: "This page",
                    value: data.length,
                  },
                ]}
                onChange={(val) => {
                  if (optionsExport) {
                    setOptionsExport({
                      ...optionsExport,
                      value: val,
                      page: page,
                    });
                  }
                }}
                placeholder="Choose Option"
              />
              <p>
                {totalRecordExport !== null
                  ? totalRecordExport
                  : optionsExport?.value
                  ? optionsExport.value
                  : total}
              </p>
            </Space>
            <Space size={8}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" onClick={handleExport}>
                OK
              </Button>
            </Space>
          </Flex>
        );
      }}
    >
      <div className="h-full w-full relative">
        {isLoading && <Loading type="screen" />}
        <div className="">
          <p className="mb-2">Choose Time</p>
          <RangePicker
            onChange={(val) => {
              const from = val?.[0]?.toISOString();
              const to = val?.[1]?.toISOString();
              setTimeRange({
                fromDate: from,
                toDate: to,
              });
            }}
            title="Choose time"
          />
        </div>
        <div className="mt-4">
          <p>Choose option</p>
        </div>
        <List
          dataSource={formData?.formItems}
          renderItem={(item, index) => {
            return (
              <List.Item key={index}>
                <Checkbox
                  checked={optionsExport?.select.includes(item.value)}
                  onChange={(e) => {
                    let arr = optionsExport?.select
                      ? [...optionsExport.select]
                      : [];
                    const name = e.target.name;
                    const checked = e.target.checked;
                    if (checked) {
                      arr.push(name || "");
                    } else {
                      arr = arr.filter((item) => item !== name);
                    }
                    if (optionsExport) {
                      setOptionsExport({
                        ...optionsExport,
                        select: arr,
                      });
                    }
                  }}
                  name={item.value}
                >
                  {item.label}{" "}
                </Checkbox>
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default ModalExportSupplier;
