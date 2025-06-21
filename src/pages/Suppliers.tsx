/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, message, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import { useEffect, useState } from "react";
import { IoFilterOutline } from "react-icons/io5";
import ModalToggleSupplier from "../components/modals/ModalToggleSupplier";
import type { Supplier } from "../models/supplier";
import { handleAPI } from "../apis/request";
import MyTable from "../components/MyTable";
import { columns } from "../components/supplier/columns";
import ModalExportSupplier from "../components/modals/ModalExportSupplier";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supplierSelect, setSupplierSelect] = useState<Supplier>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecord, setTotalRecord] = useState(10);
  const [openModalExport, setOpenModalExport] = useState(false);

  const [mesApi, contextHolderMess] = message.useMessage();

  useEffect(() => {
    fetchSuppliers();
  }, [page, limit]);

  useEffect(() => {
    if (!openModal) {
      setSupplierSelect(undefined);
    }
  }, [openModal]);

  const fetchSuppliers = async () => {
    const api = `/suppliers?page=${page}&limit=${limit}`;
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
      <div className="w-full bg-white px-2 py-3 rounded-md">
        <Flex justify="space-between" align="center">
          <p className="text-lg font-medium">Suppliers</p>
          <Space size={5}>
            <Button type="primary" onClick={() => setOpenModal(true)}>
              Add Supplier
            </Button>
            <Button icon={<IoFilterOutline size={16} />}>Filters</Button>
            <Button onClick={() => setOpenModalExport(true)}>
              Download all
            </Button>
          </Space>
        </Flex>
        <div className="w-full h-full mt-3">
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
          />
        </div>
      </div>
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
