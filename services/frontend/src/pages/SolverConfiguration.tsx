import { Link, useNavigate } from "@tanstack/react-location";
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

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
      >
        <button
          onClick={() => navigate({ to: "/solver-config/undefined" })}
          style={{ width: "auto" }}
        >
          New solver
        </button>
      </div>
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
                <button
                  onClick={() =>
                    navigate({ to: "/solver-config/" + solver.name })
                  }
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
