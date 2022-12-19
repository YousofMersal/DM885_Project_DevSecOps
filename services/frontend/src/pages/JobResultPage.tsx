import { useMatch } from "@tanstack/react-location";
import React, { useEffect, useRef, useState } from "react";
import { apiCancelJob, apiGetJob, apiGetJobResult } from "../request";
import { ApiJob, ApiJobResult } from "../types";

function useInterval(callback: any, delay: number | null) {
  const savedCallback = useRef<any>();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export const JobResultPage: React.FC = () => {
  const match = useMatch();
  const jobId = match.params.id;
  const [job, setJob] = useState<ApiJob | undefined>(undefined);
  const [result, setResult] = useState<ApiJobResult[]>([]);

  const doJob = () =>
    apiGetJob(jobId).then((r) => {
      setJob(r);
    });

  useInterval(doJob, job?.job_status !== "finished" ? 10000 : null);

  useEffect(() => {
    if (job?.job_status === "finished") {
      apiGetJobResult(job.job_id).then((result_) => setResult(result_));
    }
  }, [job]);

  return (
    <div>
      <p>{job?.job_status}</p>
      <p>{job?.created_at}</p>
      <p>{job?.finished_at}</p>
      <button onClick={() => apiCancelJob(jobId)}>Cancel</button>
      {result ? (
        <div>
          <p>Result</p>
          {result.map((r) => (
            <ul>
              {Object.keys(r.data).map((key) => (
                <li>{`${key} : ${r.data[key]}`}</li>
              ))}
              <hr />
              <li>Status: {r.sol_status}</li>
            </ul>
          ))}
        </div>
      ) : null}
    </div>
  );
};
