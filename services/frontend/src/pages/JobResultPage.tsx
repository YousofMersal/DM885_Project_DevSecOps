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
  const [result, setResult] = useState<ApiJobResult[] | undefined>(undefined);
  const [err, setErr] = useState("");

  const getJob = () =>
    apiGetJob(jobId).then((r) => {
      setJob(r);
    });

  useEffect(() => {
    getJob();
  }, []);

  useInterval(getJob, job?.job_status !== "finished" ? 5000 : null);

  useEffect(() => {
    if (job?.job_status === "finished") {
      apiGetJobResult(job.job_id).then((result_) => setResult(result_));
    }
  }, [job]);

  let renderedResult = <p>No result yet...</p>;

  if (Array.isArray(result) && result.length) {
    renderedResult = (
      <div>
        <p>Result</p>
        {result.map((r) => (
          <ul>
            {Object.keys(r.data).map((key) => (
              <li>{`${key} : ${r.data[key]}`}</li>
            ))}
            <hr />
            <li>Solver Id: {r.solver_id}</li>
            <li>Status: {r.sol_status}</li>
          </ul>
        ))}
      </div>
    );
  } else if (Array.isArray(result)) {
    renderedResult = <p>Solver ran but no result found</p>;
  }

  return (
    <div>
      <p>Status: {job?.job_status}</p>
      <p>Created at: {job?.created_at}</p>
      <p>Finished at: {job?.finished_at}</p>
      {job?.job_status !== "finished" ? (
        <button
          onClick={() => {
            setErr("");

            apiCancelJob(jobId).catch((e) => {
              setErr(e instanceof Error ? e.message : "Unknown error");
            });
          }}
        >
          Cancel
        </button>
      ) : null}
      <p>{err}</p>
      {renderedResult}
    </div>
  );
};
