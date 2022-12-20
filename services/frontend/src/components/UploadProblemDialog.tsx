import { Button, Form, Input, Modal, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useRef } from "react";
import { apiSaveModel } from "../request";
import { createModelData, handleError } from "../utils/common";

interface IUploadProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const getFile = (e: any) => {
  console.log("Upload event:", e);

  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

export const UploadProblemDialog: React.FC<IUploadProblemDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    console.log("");

    try {
      const fields = createModelData.parse({
        content: fd.get("content"),
        name: fd.get("name"),
      });

      await apiSaveModel({
        content: fields.content,
        name: fields.name,
      });

      onClose();
      onSubmit();
    } catch (e) {
      console.log(e);
      handleError(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.show();
    } else {
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} footer={[]}>
      <form onSubmit={handleSubmit}>
        <Form.Item label="Name">
          <Input type="text" required={true} name="name" />
        </Form.Item>
        <Form.Item label="Model" name="content" getValueFromEvent={getFile}>
          <TextArea name="content" />
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
