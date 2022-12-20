import { Link } from "@tanstack/react-location";
import { Button, Table } from "antd";
import React, { useEffect, useState } from "react";
import { UploadProblemDialog } from "../components/UploadProblemDialog";
import { apiListModels } from "../request";
import { ApiModel } from "../types";
import type { ColumnsType } from "antd/es/table";

export const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [problems, setProblems] = useState<ApiModel[]>([]);

  const getModels = () => apiListModels().then((result) => setProblems(result));

  useEffect(() => {
    getModels();
  }, []);

  const columns: ColumnsType<ApiModel> = [
    {
      title: "Id",
      dataIndex: "model_id",
      key: "model_id",
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
      dataIndex: "model_id",
      render: (key) => (
        <Link to={`/problems/${key}`}>
          <Button>View</Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <Button type="primary" onClick={() => setIsOpen(true)}>
          New model
        </Button>
      </div>
      <Table columns={columns} dataSource={problems} />
      <UploadProblemDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={getModels}
      />
    </div>
  );
};
