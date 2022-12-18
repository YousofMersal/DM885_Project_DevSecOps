import React, { useEffect, useState } from "react";
import { apiGetUsers } from "../request";
import { ApiUser } from "../types";

interface IUsersProps {}

export const Users: React.FC<IUsersProps> = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);

  useEffect(() => {
    apiGetUsers().then((r) => setUsers(r));
  }, []);

  return (
    <div>
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
          {users.map((user, i) => (
            <tr key={i}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
