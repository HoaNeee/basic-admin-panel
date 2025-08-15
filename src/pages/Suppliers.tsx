/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Select, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import ModalToggleSupplier from "../components/modals/ModalToggleSupplier";
import type { Supplier } from "../models/supplier";
import { handleAPI } from "../apis/request";
import MyTable from "../components/MyTable";
import { columns } from "../components/supplier/columns";
import ModalExportSupplier from "../components/modals/ModalExportSupplier";
import TableFilter from "../components/TableFilter";
import type { SelectModel, FormModel } from "../models/formModel";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supplierSelect, setSupplierSelect] = useState<Supplier>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);
  const [openModalExport, setOpenModalExport] = useState(false);
  const [valueFilter, setValueFilter] = useState<{
    isTakingReturn?: number;
    categories?: string[];
  }>();
  const [filter, setFilter] = useState<{
    isTakingReturn?: number;
    categories?: string[];
  }>();
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState<FormModel>();
  const [dataSelectCategories, setDataSelectCategories] = useState<
    SelectModel[]
  >([]);

  const [mesApi, contextHolderMess] = message.useMessage();

  useEffect(() => {
    getForm();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [page, limit, keyword, filter]);

  useEffect(() => {
    if (!openModal) {
      setSupplierSelect(undefined);
    }
  }, [openModal]);

  const fetchSuppliers = async () => {
    const api = `/suppliers?page=${page}&limit=${limit}&keyword=${keyword}&isTakingReturn=${
      filter?.isTakingReturn ?? ""
    }&categories=${filter?.categories?.join(",") ?? ""}`;
    try {
      setIsLoading(true);
      const response: any = await handleAPI(api);
      setTotalRecord(response.totalRecord);

      setSuppliers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getForm = async () => {
    const api = `/suppliers/get-form`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setFormData(response.data);
      const formItems = response.data.formItems;
      if (Array.isArray(formItems)) {
        const categories =
          formItems.find((item) => item.key === "categories")?.look_items || [];
        setDataSelectCategories(categories);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideModalExport = () => {
    setOpenModalExport(false);
  };
  const handleDeleteItem = async (id: string) => {
    try {
      const response: any = await handleAPI(
        "/suppliers/delete/" + id,
        undefined,
        "delete"
      );
      setSuppliers(suppliers.filter((item) => item._id !== id));
      mesApi.success(response.message);
    } catch (error) {
      console.log(error);
    }
  };

  const columnsSupplier: ColumnType<Supplier>[] = columns(
    page,
    limit,
    setSupplierSelect,
    setOpenModal,
    handleDeleteItem
  );

  return (
    <>
      {contextHolderMess}
      <TableFilter
        title="Suppliers"
        extra={
          <Space size={5} wrap>
            <Button type="primary" onClick={() => setOpenModal(true)}>
              Add Supplier
            </Button>
            <Button onClick={() => setOpenModalExport(true)}>
              Download all
            </Button>
          </Space>
        }
        filter={
          <div className="flex flex-col gap-4">
            <Select
              value={valueFilter?.categories || undefined}
              options={dataSelectCategories}
              placeholder="Select Category"
              onChange={(value) => {
                setValueFilter({
                  ...valueFilter,
                  categories: value,
                });
              }}
              allowClear
              className="w-full"
              mode="multiple"
            />
            <Select
              value={valueFilter?.isTakingReturn || undefined}
              options={[
                {
                  label: "Taking Return",
                  value: 1,
                },
                { label: "Not Taking Return", value: 0 },
              ]}
              placeholder="Select Type"
              onChange={(value) => {
                setValueFilter({
                  ...valueFilter,
                  isTakingReturn: value,
                });
              }}
              allowClear
              className="w-full"
            />
          </div>
        }
        onSearch={(value) => {
          if (page !== 1) {
            setPage(1);
          }
          setKeyword(value);
        }}
        onFilter={() => {
          if (page !== 1) {
            setPage(1);
          }
          console.log(valueFilter);
          setFilter(valueFilter);
        }}
        onClearFilter={() => {
          setValueFilter(undefined);
          setFilter(undefined);
        }}
      >
        <MyTable
          columns={columnsSupplier}
          data={suppliers}
          onChange={(page, limit) => {
            setLimit(limit);
            setPage(page);
          }}
          onShowSizeChange={(_curr, size) => {
            setLimit(size);
          }}
          rowKey="_id"
          loading={isLoading}
          total={totalRecord}
          scroll={{
            x: 800,
            y: 470,
          }}
        />
      </TableFilter>
      <ModalToggleSupplier
        isOpen={openModal}
        closeModal={() => setOpenModal(false)}
        onAddNew={(val) => {
          setSuppliers([val, ...suppliers]);
        }}
        supplier={supplierSelect}
        mesApi={mesApi}
        onUpdate={(val) => {
          setSuppliers((sup) => {
            const arr = [...sup];
            const idx = arr.findIndex((item) => item._id === val._id);
            if (idx !== -1) {
              arr[idx] = val;
            }
            return arr;
          });
        }}
        formData={formData}
      />

      {/* export */}

      <ModalExportSupplier
        closeModal={hideModalExport}
        isOpen={openModalExport}
        data={suppliers}
        page={page}
        total={totalRecord}
      />
    </>
  );
};

export default Suppliers;
