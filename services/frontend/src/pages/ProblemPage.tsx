import { useMatch, useNavigate } from "@tanstack/react-location";
import React, { useEffect, useState } from "react";
import {
  apiGetModel,
  apiListDataForModel,
  apiRemoveModel,
  apiRemoveModelData,
  apiStartJob,
} from "../request";
import { ApiModel, ApiModelData } from "../types";

export const ProblemPage: React.FC = () => {
  const [model, setModel] = useState<ApiModel>();
  const [data, setData] = useState<ApiModelData[]>([]);
  const navigate = useNavigate();

  const match = useMatch();
  const modelId = match.params.id;

  const getData = () =>
    apiListDataForModel(modelId).then((result) => setData(result));

  useEffect(() => {
    apiGetModel(modelId).then((result) => setModel(result));
    getData();
  }, [match]);

  return (
    <div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div>ID: {model?.model_id} </div>
          <div>Name: {model?.name} </div>
        </div>
        <div>
          <button
            onClick={() =>
              apiRemoveModel(modelId).then(() => navigate({ to: "/" }))
            }
            style={{
              background: "red",
              borderColor: "red",
            }}
          >
            Remove
          </button>
        </div>
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
          {data?.map((data) => (
            <tr key={data.data_id}>
              <td>{data.data_id}</td>
              <td>{data.name}</td>
              <td>{data.content}</td>
              <td>
                <button
                  onClick={() =>
                    navigate({
                      to: `/problems/${modelId}/data/${data.data_id}`,
                    })
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    apiRemoveModelData(data.model_id, data.data_id).then((r) =>
                      getData()
                    )
                  }
                >
                  Remove
                </button>
                <button
                  onClick={() =>
                    navigate({
                      to: `/problems/${modelId}/data/${data.data_id}/job`,
                    })
                  }
                >
                  Start job
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => navigate({ to: `/problems/${match.params.id}/data` })}
      >
        Upload data
      </button>
      <button
        onClick={() =>
          navigate({ to: `/problems/${modelId}/data/undefined/job` })
        }
      >
        Start job without data
      </button>
    </div>
  );
};
