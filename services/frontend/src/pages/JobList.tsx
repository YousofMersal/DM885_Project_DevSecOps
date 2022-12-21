import { useNavigate } from "@tanstack/react-location";
import { Button } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { isValid } from "date-fns";
import React, { useEffect, useState } from "react";
import { apiListJobs } from "../request";
import { ApiJob } from "../types";

interface IJobListProps {}

export const JobList: React.FC<IJobListProps> = () => {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const navigate = useNavigate();

  const getJobs = () =>
    apiListJobs().then((result) =>
      setJobs(
        result.sort((x, y) => {
          return (
            new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
          );
        })
      )
    );

  useEffect(() => {
    getJobs();
  }, []);

  const columns: ColumnsType<ApiJob> = [
    {
      title: "Id",
      dataIndex: "job_id",
      key: "job_id",
    },
    {
      title: "Status",
      dataIndex: "job_status",
      key: "job_status",
    },
    {
      title: "Created at",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Finished at",
      dataIndex: "finished_at",
      key: "finished_at",
    },
    {
      title: "Model id",
      dataIndex: "model_id",
      key: "model_id",
    },
    {
      title: "",
      dataIndex: "job_id",
      render: (key) => (
        <Button
          onClick={() => {
            navigate({
              to: `/jobs/${key}`,
            });
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <Table dataSource={jobs} columns={columns} />
    </div>
  );
};
