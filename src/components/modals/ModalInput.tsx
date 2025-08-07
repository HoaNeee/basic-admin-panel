import { Input, Modal } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useEffect, useState } from "react";

const ModalInput = ({
  open,
  onOk,
  onCancel,
  messageApi,
  title,
  isLoading,
}: {
  open: boolean;
  onOk: (value: string) => void;
  onCancel: () => void;
  messageApi: MessageInstance;
  title?: string;
  isLoading?: boolean;
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setValue("");
    }
    return () => {
      setValue("");
    };
  }, [open]);

  return (
    <Modal
      title="AI Assistant"
      confirmLoading={isLoading}
      maskClosable={!isLoading}
      closable={!isLoading}
      open={open}
      onOk={() => {
        if (value.trim() === "") {
          messageApi.error("Input cannot be empty");
          return;
        }
        onOk(value);
      }}
      onCancel={onCancel}
    >
      <p className="mb-4 text-gray-600">{title}</p>
      <Input.TextArea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask something..."
      />
    </Modal>
  );
};

export default ModalInput;
