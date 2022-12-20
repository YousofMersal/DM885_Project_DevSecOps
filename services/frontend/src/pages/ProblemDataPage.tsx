import { useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Form, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useState } from "react";
import { apiSaveDataOnModel } from "../request";
import { createModelData, handleError } from "../utils/common";

interface IProblemDataPageProps {}

export const ProblemDataPage: React.FC<IProblemDataPageProps> = () => {
  const match = useMatch();
  const modelId = match.params.id;
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    console.log("btn");
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    try {
      const fields = createModelData.parse({
        content: fd.get("content"),
        name: fd.get("name"),
      });

      await apiSaveDataOnModel(Number(modelId), fields.name, fields.content);

      navigate({
        to: `/problems/${modelId}`,
      });
    } catch (e) {
      setError(handleError(e));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Form.Item label="Name">
        <Input name="name" />
      </Form.Item>
      <Form.Item label="Content">
        <TextArea
          name="content"
          style={{
            height: 300,
          }}
        />
      </Form.Item>
      {error ? <p>{error}</p> : null}
      <Button htmlType="submit" type="primary">
        Submit
      </Button>
    </form>
  );
};
