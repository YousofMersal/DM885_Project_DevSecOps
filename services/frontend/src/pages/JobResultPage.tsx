import { useMatch } from "@tanstack/react-location";
import { Alert, Button, Card, Divider, Space, Spin, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { apiCancelJob, apiGetJob, apiGetJobResult } from "../request";
import { ApiJob, ApiJobResult } from "../types";
import { differenceInMinutes, differenceInSeconds, isValid } from "date-fns";

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
  const [isDisabled, setIsDisabled] = useState(false);

  const getJob = () =>
    apiGetJob(jobId).then((r) => {
      setJob(r);
    });

  useEffect(() => {
    getJob();
  }, []);

  const isRunning = job?.job_status !== "finished";

  useInterval(getJob, isRunning ? 5000 : null);

  useEffect(() => {
    if (job?.job_status === "finished") {
      apiGetJobResult(job.job_id).then((result_) => setResult(result_));
    }
  }, [job]);

  let renderedResult = (
    <Typography.Paragraph style={{ fontWeight: "bold" }}>
      👁️ No result yet...
    </Typography.Paragraph>
  );

  if (Array.isArray(result) && result.length) {
    renderedResult = (
      <div>
        <Typography.Paragraph>Result:</Typography.Paragraph>
        <Space>
          {result.map((r) => (
            <Card title={r.solver_id}>
              <Typography.Paragraph>
                Solver Id: {r.solver_id}
              </Typography.Paragraph>
              <Typography.Paragraph>
                Status: {r.sol_status}
              </Typography.Paragraph>
              <Typography.Paragraph>
                Found at: {r.found_at}
              </Typography.Paragraph>
              <Divider />
              {Object.keys(r.data).map((key) => (
                <Typography.Paragraph>{`${key} : ${r.data[key]}`}</Typography.Paragraph>
              ))}
            </Card>
          ))}
        </Space>
      </div>
    );
  } else if (Array.isArray(result)) {
    renderedResult = (
      <Typography.Paragraph style={{ fontWeight: "bold" }}>
        🍭 Solver ran but no result found
      </Typography.Paragraph>
    );
  }

  let type: "success" | "info" | "warning" | "error" | undefined = undefined;

  if (job?.job_status === "running") {
    type = "info";
  } else if (job?.job_status === "finished") {
    type = "success";
  }

  const diff =
    job &&
    isValid(new Date(job.created_at)) &&
    job.finished_at &&
    isValid(new Date(job.finished_at))
      ? differenceInSeconds(new Date(job.finished_at), new Date(job.created_at))
      : "";

  return (
    <div>
      <div style={{ marginBottom: 10 }}>{isRunning ? <Spin /> : null}</div>
      <Alert
        message={`Job status: ${job?.job_status}. ${
          diff ? `Time estimated: ${diff} seconds` : ""
        }`}
        type={type}
        showIcon
      />
      <div style={{ marginTop: 20 }}>
        <Typography.Paragraph>Status: {job?.job_status}</Typography.Paragraph>
        <Typography.Paragraph>
          Created at: {job?.created_at}
        </Typography.Paragraph>
        <Typography.Paragraph>
          Finished at: {job?.finished_at}
        </Typography.Paragraph>
      </div>
      {job?.job_status !== "finished" ? (
        <Space>
          <Button
            danger
            disabled={isDisabled}
            onClick={() => {
              setErr("");

              setIsDisabled(true);
              apiCancelJob(jobId).catch((e) => {
                setErr(e instanceof Error ? e.message : "Unknown error");
              });
            }}
          >
            Cancel all
          </Button>
          {job?.solvers.map((solver) => (
            <Button
              danger
              onClick={() => {
                setErr("");

                setIsDisabled(true);
                apiCancelJob(jobId, solver.solver_id).catch((e) => {
                  setErr(e instanceof Error ? e.message : "Unknown error");
                });
              }}
              disabled={isDisabled}
            >
              Cancel {solver.name} - ID: {solver.solver_id}
            </Button>
          ))}
        </Space>
      ) : null}
      <p>{err}</p>
      <Divider />
      {renderedResult}
    </div>
  );
};
