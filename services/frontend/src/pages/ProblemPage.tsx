import React from "react";
import { apiStartJob } from "../request";

export const ProblemPage: React.FC = () => {
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
      <div>I am a problem </div>
      <button onClick={handleStartJob}>Start job</button>
    </div>
  );
};
