import { useMatch } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import { apiGetModel, apiStartJob } from "../request";
import { ApiModel } from "../types";

export const ProblemPage: React.FC = () => {
  const [model, setModel] = useState<ApiModel>();

  const match = useMatch();

  useEffect(() => {
    apiGetModel(match.params.id).then((result) => setModel(result));
  }, [match]);

  const handleStartJob = async () => {
    try {
      const response = await apiStartJob();
      console.log("handleStartJob success", response);
    } catch (e) {
      console.log("handleStartJob fail", e);
    }
  };

  return (
    <div>
      <div>{model?.model_id} </div>
      <div>{model?.name} </div>
      <button onClick={handleStartJob}>Start job</button>
    </div>
  );
};
