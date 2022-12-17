import { useMatch, useNavigate } from "@tanstack/react-location";
import React, { useEffect, useRef, useState } from "react";
import { apiEditModel, apiGetModel } from "../request";
import {
  createModelData,
  createProblemPayload,
  handleError,
} from "../utils/common";

interface IEditProblemPageProps {}

export const EditProblemPage: React.FC<IEditProblemPageProps> = () => {
  const refContent = useRef<HTMLInputElement>(null);
  const refName = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const match = useMatch();
  const modelId = match.params.id;
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetModel(modelId).then((result) => {
      refContent.current!.value = result.content;
      refName.current!.value = result.name;
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
      <label>Name</label>
      <input type="text" ref={refName} required={true} name="name" />
      <div>
        <label>Model</label>
        <textarea
          ref={refContent}
          name="content"
          required={true}
          style={{ height: 200 }}
        />
      </div>
      {error ? <div>{error} </div> : null}
      <button type="submit">Update</button>
    </form>
  );
};
