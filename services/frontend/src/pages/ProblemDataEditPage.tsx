import { useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Form, Input, InputRef } from "antd";
import TextArea, { TextAreaRef } from "antd/es/input/TextArea";
import React, { useEffect, useRef } from "react";
import { apiGetModelData, apiUpdateDataOnModel } from "../request";
import { createModelData, handleError } from "../utils/common";

interface IProblemDataEditPageProps {}

export const ProblemDataEditPage: React.FC<IProblemDataEditPageProps> = () => {
  const match = useMatch();
  const navigate = useNavigate();

  const nameRef = useRef<InputRef>(null);
  const contentRef = useRef<TextAreaRef>(null);

  const modelId = match.params.id;
  const dataId = match.params.data_id;

  useEffect(() => {
    apiGetModelData(modelId, dataId).then((result) => {
      nameRef.current!.input!.value = result.name;
      contentRef.current!.resizableTextArea!.textArea.value = result.content;
    });
  }, [modelId, dataId]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    console.log("btn");
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    try {
      const fields = createModelData.parse({
        content: fd.get("content"),
        name: fd.get("name"),
      });

      await apiUpdateDataOnModel(dataId, modelId, fields.name, fields.content);

      navigate({
        to: `/problems/${modelId}`,
      });
    } catch (e) {
      // setError(handleError(e));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Form.Item label="Name">
          <Input name="name" ref={nameRef} />
        </Form.Item>
        <Form.Item label="Content">
          <TextArea ref={contentRef} name="content" />
        </Form.Item>
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </form>
    </div>
  );
};
