import { Button, Space } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import Paragraph from "antd/es/typography/Paragraph";
import React, { useEffect, useState } from "react";
import { EditUserDialog } from "../components/EditUserDialog";
import { apiGetJobUsers, apiGetUsers, apiRemoveUser } from "../request";
import { ApiUser, ApiUserInfo } from "../types";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersInfo, setUsersInfo] = useState<ApiUserInfo[]>([]);

  const [selectedUser, setSelectedUser] = useState<ApiUser | undefined>(
    undefined
  );

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
      dataIndex: "id",
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

        return <Paragraph>Didn't start a job yet.</Paragraph>;
      },
    },
    {
      title: "",
      render: (key: ApiUser) => {
        const info = Boolean(usersInfo.find((info) => info.user_id === key.id));

        return (
          <Space>
            <Button disabled={!info} onClick={() => setSelectedUser(key)}>
              Edit
            </Button>
            <Button
              danger
              onClick={() => apiRemoveUser(key.username).then(() => getUsers())}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={users} />
      <EditUserDialog
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(undefined)}
        onSubmit={getJobUsers}
        userId={selectedUser?.id}
      />
    </div>
  );
};
