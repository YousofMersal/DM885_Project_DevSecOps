import { useMatch, useNavigate } from "@tanstack/react-location";
import React, { useState } from "react";
import { apiSaveDataOnModel } from "../request";
import {
  createModelData,
  createProblemPayload,
  handleError,
} from "../utils/common";

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
      <label>Name</label>
      <input name="name" />
      <label>Content</label>
      <textarea
        name="content"
        style={{
          height: 300,
        }}
      />
      {error ? <p>{error}</p> : null}
      <button type="submit">Submit</button>
    </form>
  );
};
