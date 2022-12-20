import { Link, useMatch, useNavigate } from "@tanstack/react-location";
import { Button } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { apiGetJob, apiListSolvers, apiStartJob } from "../request";
import { ApiJob, ApiSolver } from "../types";

interface IJobPageProps {}

export const JobPage: React.FC<IJobPageProps> = () => {
  const [solvers, setSolvers] = useState<ApiSolver[]>([]);
  const [selectedSolvers, setSelectedSolvers] = useState<number[]>([]);
  const match = useMatch();
  const modelId = match.params.id;
  const dataId = match.params.data_id;
  const navigate = useNavigate();

  useEffect(() => {
    apiListSolvers().then((result) => setSolvers(result));
  }, []);

  const handleStart = async () => {
    try {
      const result = await apiStartJob(
        Number(modelId),
        selectedSolvers,
        dataId !== "undefined" ? Number(dataId) : undefined
      );
      navigate({ to: `/jobs/${result.job_id}` });

      console.log("succes");
    } catch (e) {
      console.log("e", e);
    }
  };

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
      title: "Content",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "",
      dataIndex: "solver_id",
      render: (key) =>
        selectedSolvers.includes(key) ? (
          <Button
            onClick={() => {
              setSelectedSolvers((prev) => prev.filter((s) => s !== key));
            }}
          >
            Deselect
          </Button>
        ) : (
          <Button
            onClick={() => {
              setSelectedSolvers((prev) => prev.concat(key));
            }}
          >
            Select
          </Button>
        ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={solvers} />
      <Button
        disabled={!selectedSolvers.length}
        type="primary"
        onClick={handleStart}
      >
        Start job
      </Button>
    </div>
  );
};
