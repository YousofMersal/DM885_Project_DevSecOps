import { Link, useMatch, useNavigate } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import { apiGetJob, apiListSolvers, apiStartJob } from "../request";
import { ApiSolver } from "../types";

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

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Content</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {solvers.map((solver) => (
            <tr key={solver.solver_id}>
              <td>{solver.solver_id}</td>
              <td>{solver.name}</td>
              <td>{solver.image}</td>
              <td>
                {selectedSolvers.includes(solver.solver_id) ? (
                  <button
                    onClick={() => {
                      setSelectedSolvers((prev) =>
                        prev.filter((s) => s !== solver.solver_id)
                      );
                    }}
                  >
                    Deselect
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSolvers((prev) =>
                        prev.concat(solver.solver_id)
                      );
                    }}
                  >
                    Select
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleStart}>Start job</button>
    </div>
  );
};
