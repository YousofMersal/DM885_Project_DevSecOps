import { Link, useNavigate } from "@tanstack/react-location";
import { Button, Space } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { apiDeleteSolver, apiListSolvers } from "../request";
import { ApiSolver } from "../types";

interface ISolverConfigurationProps {}

export const SolverConfiguration: React.FC<ISolverConfigurationProps> = () => {
  const [solvers, setSolvers] = useState<ApiSolver[]>([]);
  const navigate = useNavigate();

  const getSolvers = () =>
    apiListSolvers().then((result) => setSolvers(result));

  useEffect(() => {
    getSolvers();
  }, []);

  const columns: ColumnsType<ApiSolver> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
    },
    {
      title: "",
      render: (solver: ApiSolver) => (
        <Space>
          <button
            onClick={() => navigate({ to: "/solver-config/" + solver.name })}
          >
            Edit
          </button>
          <button
            onClick={() =>
              apiDeleteSolver(solver.solver_id).then(() => getSolvers())
            }
          >
            Delete
          </button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => navigate({ to: "/solver-config/undefined" })}
          type="primary"
        >
          New solver
        </Button>
      </div>
      <Table dataSource={solvers} columns={columns} />
    </div>
  );
};
