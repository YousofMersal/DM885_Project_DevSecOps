import { Button } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { apiGetJobUsers, apiGetUsers, apiRemoveUser } from "../request";
import { ApiUser } from "../types";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);

  const getUsers = () => apiGetUsers().then((r) => setUsers(r));

  const getJobUsers = () => apiGetJobUsers().then((r) => console.log("r", r));

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
      title: "",
      dataIndex: "username",
      key: "username",
      render: (key) => (
        <Button
          danger
          onClick={() => apiRemoveUser(key).then(() => getUsers())}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={users} />
    </div>
  );
};
