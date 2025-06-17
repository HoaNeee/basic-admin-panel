/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Flex, Form, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { CiUser } from "react-icons/ci";
import { handleAPI, uploadImage } from "../../apis/request";
import type { Supplier } from "../../models/supplier";
import type { MessageInstance } from "antd/es/message/interface";
import type { FormModel } from "../../models/formModel";
import MyForm from "../MyForm";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  onAddNew: (val: Supplier) => void;
  onUpdate: (val: Supplier) => void;
  supplier?: Supplier;
  mesApi: MessageInstance;
}

const ModalToggleSupplier = (props: Props) => {
  const { isOpen, closeModal, onAddNew, supplier, mesApi, onUpdate } = props;

  const [file, setFile] = useState<any>();
  const [isTaking, setIsTaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormModel>();

  const inpFileRef = useRef<any>();

  const [form] = Form.useForm();

  useEffect(() => {
    getForm();
  }, []);

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue(supplier);
      setIsTaking(supplier.isTaking === 1);
    }
  }, [supplier]);

  const getForm = async () => {
    const api = `/suppliers/get-form`;
    try {
      setIsLoading(true);
      const response = await handleAPI(api);
      setFormData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    const data: any = {};
    for (const item in values) {
      data[item] = values[item] || "";
    }
    data.price = Number(data.price || 0);
    data.isTaking = isTaking ? 1 : 0;

    try {
      setIsLoading(true);

      if (file) {
        //upload file
        const uploadResponse = await uploadImage("thumbnail", file);
        data.thumbnail = uploadResponse.data;
      }

      const response: any = await handleAPI(
        `/suppliers${supplier ? "/edit/" + supplier._id : "/create"}`,
        data,
        `${supplier ? "patch" : "post"}`
      );
      if (!supplier) {
        onAddNew(response.data);
      } else {
        onUpdate({
          ...supplier,
          ...data,
        });
      }
      mesApi.success(response.message);
      handleCloseModal();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    form.resetFields();
    setFile(undefined);
    if (inpFileRef.current) inpFileRef.current.value = "";
    setIsLoading(false);
    setIsTaking(false);
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      title="New Supplier"
      onCancel={handleCloseModal}
      centered
      footer={false}
    >
      <div className="text-center">
        <label
          htmlFor="image-picker"
          className="inline-flex py-3 items-center justify-center gap-3 relative"
        >
          {file ? (
            <Avatar
              src={URL.createObjectURL(file)}
              style={{
                width: 80,
                height: 80,
                backgroundColor: "transparent",
                border: "2px dashed #ddd",
              }}
            />
          ) : supplier && supplier.thumbnail ? (
            <Avatar
              src={supplier.thumbnail || ""}
              style={{
                width: 80,
                height: 80,
                backgroundColor: "transparent",
                border: "2px dashed #ddd",
              }}
            />
          ) : (
            <Avatar
              icon={<CiUser size={50} color="#bababa" />}
              style={{
                width: 80,
                height: 80,
                backgroundColor: "transparent",
                border: "2px dashed #ddd",
              }}
            />
          )}
          <div className="text-gray-400 flex flex-col items-center justify-center">
            <span>Drag image here</span>
            <span>or</span>
            <span className="text-blue-400 cursor-pointer">Browse image</span>
            <input
              ref={inpFileRef}
              type="file"
              accept="image/*"
              className="h-full w-full absolute top-0 left-0 opacity-0 cursor-pointer"
              id="image-picker"
              name="thumbnail"
              onChange={(e) => {
                if (e.target.files) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </label>
      </div>
      <div className="mt-4" />
      <MyForm
        form={form}
        formData={formData}
        onFinish={handleFinish}
        isTaking={isTaking}
        setIsTaking={setIsTaking}
      />
      <Flex gap={6} justify="flex-end">
        <Button onClick={closeModal}>Discard</Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={isLoading}
        >
          {supplier ? "Update" : "Add Supplier"}
        </Button>
      </Flex>
    </Modal>
  );
};

export default ModalToggleSupplier;
