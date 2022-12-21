import { Link, useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Form, Input } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import {
  apiGetJob,
  apiListSolvers,
  apiStartJob,
  SolverJobInfo,
} from "../request";
import { ApiJob, ApiSolver } from "../types";

interface IJobPageProps {}

export const JobPage: React.FC<IJobPageProps> = () => {
  const [solvers, setSolvers] = useState<ApiSolver[]>([]);
  const [selectedSolvers, setSelectedSolvers] = useState<number[]>([]);
  const match = useMatch();
  const modelId = match.params.id;
  const dataId = match.params.data_id;
  const navigate = useNavigate();
  const [solverResources, setSolverResources] = useState<
    Omit<SolverJobInfo, "solver_id">[]
  >([]);

  useEffect(() => {
    apiListSolvers().then((result) => {
      setSolvers(result);
      setSolverResources(
        result.map((r) => ({
          cpus: 4,
          memory: 100,
          timeout: 60,
        }))
      );
    });
  }, []);

  const handleStart = async () => {
    try {
      const result = await apiStartJob(
        Number(modelId),
        solvers.map((solver, i) => ({
          solver_id: solver.solver_id,
          cpus: solverResources[i].cpus,
          memory: solverResources[i].memory,
          timeout: solverResources[i].timeout,
        })),
        dataId !== "undefined" ? Number(dataId) : undefined
      );
      navigate({ to: `/jobs/${result.job_id}` });

      console.log("succes");
    } catch (e) {
      console.log("e", e);
    }
  };

  const handleChange = (index: number, key: string, value: string) => {
    setSolverResources((prev) => {
      const copy = { ...prev };

      //@ts-expect-error
      copy[index][key] = value;

      return copy;
    });
  };

  const columns: ColumnsType<ApiSolver> = [
    {
      title: "Id",
      dataIndex: "solver_id",
      key: "solver_id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "",
      dataIndex: "",
      render: (solver: ApiSolver) => {
        const solverIndex = solvers.findIndex(
          (s) => s.solver_id === solver.solver_id
        );
        return (
          <div>
            <Form.Item label="CPU">
              <Input
                value={solverResources[solverIndex].cpus}
                onChange={(e) =>
                  handleChange(solverIndex, "cpus", e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="Memory">
              <Input
                value={solverResources[solverIndex].memory}
                onChange={(e) =>
                  handleChange(solverIndex, "memory", e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="Timeout">
              <Input
                value={solverResources[solverIndex].timeout}
                onChange={(e) =>
                  handleChange(solverIndex, "timeout", e.target.value)
                }
              />
            </Form.Item>
          </div>
        );
      },
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
      <div style={{ justifyContent: "flex-end", display: "flex" }}>
        <Button
          disabled={!selectedSolvers.length}
          type="primary"
          size="large"
          onClick={handleStart}
        >
          Start job
        </Button>
      </div>
    </div>
  );
};
