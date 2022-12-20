import Table, { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { apiGetUsers, apiRemoveUser } from "../request";
import { ApiUser } from "../types";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);

  const getUsers = () => apiGetUsers().then((r) => setUsers(r));

  useEffect(() => {
    getUsers();
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
        <button onClick={() => apiRemoveUser(key).then(() => getUsers())}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={users} />
    </div>
  );
};
