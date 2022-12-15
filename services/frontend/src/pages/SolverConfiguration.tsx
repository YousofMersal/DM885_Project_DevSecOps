import { Link } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import { apiListSolvers } from "../request";
import { ApiSolver } from "../types";

interface ISolverConfigurationProps {}

export const SolverConfiguration: React.FC<ISolverConfigurationProps> = () => {
  const [solvers, setSolvers] = useState<ApiSolver[]>([]);

  useEffect(() => {
    apiListSolvers().then((result) => setSolvers(result));
  }, []);

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
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
