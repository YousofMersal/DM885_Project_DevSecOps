import React, { useState } from "react";
import { CreateInstanceDialog } from "../components/CreateInstanceDialog";

type Instance = {
  id: number;
  name: string;
  type: "mzn" | "dzn";
};

export const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([
    {
      id: 1,
      name: "Cool",
      type: "mzn",
    },
    {
      id: 2,
      name: "Cool 2",
      type: "dzn",
    },
    {
      id: 3,
      name: "Cool test",
      type: "mzn",
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
          Create new instance
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {instances.map((instance) => (
            <tr key={instance.id}>
              <td>{instance.id}</td>
              <td>{instance.name}</td>
              <td>{instance.type}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <CreateInstanceDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
