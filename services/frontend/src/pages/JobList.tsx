import { useNavigate } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import { apiListJobs } from "../request";
import { ApiJob } from "../types";

interface IJobListProps {}

export const JobList: React.FC<IJobListProps> = () => {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const navigate = useNavigate();

  const getJobs = () => apiListJobs().then((result) => setJobs(result));

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Status</th>
            <th>Created at</th>
            <th>Finsihed at</th>
            <th>Model id</th>
            <th>Data id</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, i) => (
            <tr key={i}>
              <td>{job.job_id}</td>
              <td>{job.job_status}</td>
              <td>{job.created_at}</td>
              <td>{job.finished_at}</td>
              <td>{job.model_id}</td>
              <td>{job.data_id}</td>
              <td>
                <button
                  onClick={() => {
                    navigate({
                      to: `/jobs/${job.job_id}`,
                    });
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
