import { useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Input, InputRef } from "antd";
import FormItem from "antd/es/form/FormItem";
import TextArea, { TextAreaRef } from "antd/es/input/TextArea";
import React, { useEffect, useRef, useState } from "react";
import { apiEditModel, apiGetModel } from "../request";
import { createModelData, handleError } from "../utils/common";

interface IEditProblemPageProps {}

export const EditProblemPage: React.FC<IEditProblemPageProps> = () => {
  const refContent = useRef<TextAreaRef>(null);
  const refName = useRef<InputRef>(null);

  const navigate = useNavigate();
  const match = useMatch();
  const modelId = match.params.id;
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetModel(modelId).then((result) => {
      refContent.current!.resizableTextArea!.textArea.value = result.content;
      refName.current!.input!.value = result.name;
    });
  }, [modelId]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const fields = createModelData.parse({
        content: fd.get("content"),
        name: fd.get("name"),
      });

      await apiEditModel({
        content: fields.content,
        name: fields.name,
        id: modelId,
      });

      navigate({
        to: `/problems/${modelId}`,
      });
    } catch (e) {
      setError(handleError(e));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormItem label="Name">
        <Input type="text" ref={refName} required={true} name="name" />
      </FormItem>

      <FormItem label="Model">
        <TextArea
          ref={refContent}
          name="content"
          required={true}
          style={{
            height: 200,
          }}
        />
      </FormItem>
      {error ? <div>{error} </div> : null}
      <Button htmlType="submit" type="primary">
        Update
      </Button>
    </form>
  );
};
