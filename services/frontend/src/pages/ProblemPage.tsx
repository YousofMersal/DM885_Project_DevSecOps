import { useMatch, useNavigate } from "@tanstack/react-location";
import { Button, Space, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
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

  const columns: ColumnsType<ApiModel> = [
    {
      title: "Id",
      dataIndex: "data_id",
      key: "data_id",
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
      render: (data: ApiModelData) => (
        <Space>
          <Button
            onClick={() =>
              navigate({
                to: `/problems/${modelId}/data/${data.data_id}`,
              })
            }
          >
            Edit
          </Button>

          <Button
            onClick={() =>
              apiRemoveModelData(data.model_id, data.data_id).then((r) =>
                getData()
              )
            }
            danger
          >
            Remove
          </Button>
          <Button
            onClick={() =>
              navigate({
                to: `/problems/${modelId}/data/${data.data_id}/job`,
              })
            }
            type="primary"
          >
            Start job
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography.Title>{model?.name} </Typography.Title>
        </div>
        <Space>
          <Button
            onClick={() =>
              apiRemoveModel(modelId).then(() => navigate({ to: "/" }))
            }
            danger
          >
            Remove
          </Button>
          <Button
            onClick={() =>
              navigate({
                to: `/problems/${modelId}/edit`,
              })
            }
          >
            Edit
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} />
      <Space style={{ marginTop: 20 }}>
        <Button
          type="default"
          onClick={() => navigate({ to: `/problems/${match.params.id}/data` })}
        >
          Upload data
        </Button>
        <Button
          type="primary"
          onClick={() =>
            navigate({ to: `/problems/${modelId}/data/undefined/job` })
          }
        >
          Start job without data
        </Button>
      </Space>
    </div>
  );
};
