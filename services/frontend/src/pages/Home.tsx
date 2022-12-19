import { Link } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import { UploadProblemDialog } from "../components/UploadProblemDialog";
import { apiListModels } from "../request";
import { ApiModel } from "../types";

export const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [problems, setProblems] = useState<ApiModel[]>([]);

  const getModels = () => apiListModels().then((result) => setProblems(result));

  useEffect(() => {
    getModels();
  }, []);

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
          New model
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
          {problems.map((problem) => (
            <tr key={problem.model_id}>
              <td>{problem.model_id}</td>
              <td>{problem.name}</td>
              <td>{problem.content}</td>
              <td>
                <Link to={`/problems/${problem.model_id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UploadProblemDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={getModels}
      />
    </div>
  );
};
