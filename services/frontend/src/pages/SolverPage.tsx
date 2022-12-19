import { useMatch, useNavigate } from "@tanstack/react-location";
import React, { useEffect, useRef, useState } from "react";
import {
  apiCreateSolver,
  apiEditModel,
  apiEditSolver,
  apiGetSolver,
} from "../request";
import { createSolverData, handleError } from "../utils/common";

interface ISolverPageProps {}

export const SolverPage: React.FC<ISolverPageProps> = () => {
  const match = useMatch();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const refImage = useRef<HTMLTextAreaElement>(null);
  const refName = useRef<HTMLInputElement>(null);

  const solverId = match.params.id;

  useEffect(() => {
    if (solverId !== "undefined") {
      apiGetSolver(solverId).then((r) => {
        refImage.current!.value = r.name;
        refName.current!.value = r.image;
      });
    }
  }, [solverId]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const fields = createSolverData.parse({
        image: fd.get("image"),
        name: fd.get("name"),
      });

      if (solverId === "undefined") {
        await apiCreateSolver(fields.name, fields.image);
      } else {
        await apiEditSolver(fields.name, fields.image, solverId);
      }

      navigate({
        to: `/solver-config`,
      });
    } catch (e) {
      setError(handleError(e));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input ref={refName} type="text" required={true} name="name" />
        <div>
          <label>Image</label>
          <textarea
            ref={refImage}
            name="image"
            required={true}
            style={{ height: 200 }}
          />
        </div>
        {error ? <div>{error} </div> : null}
        <button type="submit">
          {solverId === "undefined" ? "Create" : "Update"}
        </button>
      </form>
    </div>
  );
};
