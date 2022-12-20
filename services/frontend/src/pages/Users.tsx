import { Button } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import Paragraph from "antd/es/typography/Paragraph";
import React, { useEffect, useState } from "react";
import { apiGetJobUsers, apiGetUsers, apiRemoveUser } from "../request";
import { ApiUser, ApiUserInfo } from "../types";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersInfo, setUsersInfo] = useState<ApiUserInfo[]>([]);

  const getUsers = () => apiGetUsers().then((r) => setUsers(r));

  const getJobUsers = () => apiGetJobUsers().then((r) => setUsersInfo(r));

  useEffect(() => {
    getUsers();
    getJobUsers();
  }, []);

  const columns: ColumnsType<ApiUser> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Resources",
      dataIndex: "username",
      render: (key) => {
        const info = usersInfo.find((info) => info.user_id === key);

        if (info) {
          return (
            <div>
              <Paragraph>CPU: {info.cpu_limit}</Paragraph>
              <Paragraph>Memory: {info.mem_limit}</Paragraph>
            </div>
          );
        }

        return <Paragraph>⁉️</Paragraph>;
      },
    },
    {
      title: "",
      dataIndex: "username",
      key: "username",
      render: (key) => {
        return (
          <Button
            danger
            onClick={() => apiRemoveUser(key).then(() => getUsers())}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={users} />
    </div>
  );
};
