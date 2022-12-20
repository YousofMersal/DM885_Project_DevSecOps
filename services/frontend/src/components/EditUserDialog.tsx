import { Modal, Form, Space, Button } from "antd";
import Input from "rc-input";
import TextArea from "rc-textarea";
import React from "react";
import { apiUpdateUserInfo } from "../request";
import { editUserInfo } from "../utils/common";

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
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
    <Modal title="Edit info" open={isOpen} footer={[]} onCancel={onClose}>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <Form.Item label="CPU">
          <Input type="text" required={true} name="cpu_limit" />
        </Form.Item>
        <Form.Item label="Memory" name="content">
          <TextArea name="mem_limit" />
        </Form.Item>
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
