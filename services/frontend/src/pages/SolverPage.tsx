import { useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Form, Input, InputRef } from "antd";
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

  const refImage = useRef<InputRef>(null);
  const refName = useRef<InputRef>(null);

  const solverId = match.params.id;

  useEffect(() => {
    if (solverId !== "undefined") {
      apiGetSolver(solverId).then((r) => {
        refName.current!.input!.value = r.name;
        refImage.current!.input!.value = r.image;
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
        await apiEditSolver(fields.name, fields.image);
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
        <Form.Item label="Name">
          <Input ref={refName} type="text" required={true} name="name" />
        </Form.Item>

        <div>
          <Form.Item label="Image">
            <Input ref={refImage} type="text" required={true} name="image" />
          </Form.Item>
        </div>
        {error ? <div>{error} </div> : null}
        <Button type="primary" htmlType="submit">
          {solverId === "undefined" ? "Create" : "Update"}
        </Button>
      </form>
    </div>
  );
};
