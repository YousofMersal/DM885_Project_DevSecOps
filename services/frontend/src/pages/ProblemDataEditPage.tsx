import { useMatch, useNavigate } from "@tanstack/react-location";
import React, { useEffect, useRef } from "react";
import { apiGetModelData, apiUpdateDataOnModel } from "../request";
import { createModelData, handleError } from "../utils/common";

interface IProblemDataEditPageProps {}

export const ProblemDataEditPage: React.FC<IProblemDataEditPageProps> = () => {
  const match = useMatch();
  const navigate = useNavigate();

  const nameRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const modelId = match.params.id;
  const dataId = match.params.data_id;

  useEffect(() => {
    apiGetModelData(modelId, dataId).then((result) => {
      nameRef.current!.value = result.name;
      contentRef.current!.value = result.content;
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
        <label>Name</label>
        <input name="name" ref={nameRef} />
        <label>Content</label>
        <textarea
          ref={contentRef}
          name="content"
          style={{
            height: 300,
          }}
      />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};
