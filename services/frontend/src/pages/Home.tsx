import React, { useState } from "react";
import { UploadProblemDialog } from "../components/UploadProblemDialog";

type Instance = {
  id: number;
  name: string;
  mzn: string;
  dzn?: string;
};

export const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [problems, setProblems] = useState<Instance[]>([
    {
      id: 1,
      name: "Cool",
      mzn: "Cool",
      dzn: "mzn",
    },
    {
      id: 2,
      name: "Cool",
      mzn: "Cool 2",
      dzn: "dzn",
    },
    {
      id: 3,
      name: "Cool",
      mzn: "Cool test",
    },
  ]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "auto",
          }}
        >
          Create new model
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Model</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr key={problem.id}>
              <td>{problem.id}</td>
              <td>{problem.name}</td>
              <td
                style={{
                  background: problem.mzn ? "green" : undefined,
                }}
              ></td>
              <td
                style={{
                  background: problem.dzn ? "green" : undefined,
                }}
              ></td>
            </tr>
          ))}
        </tbody>
      </table>
      <UploadProblemDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
