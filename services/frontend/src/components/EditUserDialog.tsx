import { Modal, Form, Space, Button, Input } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import React, { useState } from "react";
import { apiUpdateUserInfo } from "../request";
import { editUserInfo, handleError } from "../utils/common";

interface IEditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userId?: string;
}

export const EditUserDialog: React.FC<IEditUserDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
}) => {
  const [error, setError] = useState("");
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const fields = editUserInfo.parse({
        cpu_limit: fd.get("cpu_limit"),
        mem_limit: fd.get("mem_limit"),
      });

      await apiUpdateUserInfo(
        userId as string,
        fields.cpu_limit,
        fields.mem_limit
      );

      onClose();
      onSubmit();
    } catch (e) {
      console.log(e);
      setError(handleError(e));
    }
  };

  return (
    <Modal title="Edit info" open={isOpen} footer={[]} onCancel={onClose}>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <Form.Item label="CPU">
          <Input type="text" required={true} name="cpu_limit" />
        </Form.Item>
        <Form.Item label="Memory" name="content">
          <Input name="mem_limit" />
        </Form.Item>
        {error ? <Paragraph>{error}</Paragraph> : null}
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Space>
      </form>
    </Modal>
  );
};
