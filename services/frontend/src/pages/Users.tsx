import React, { useEffect, useState } from "react";
import { apiGetUsers, apiRemoveUser } from "../request";
import { ApiUser } from "../types";

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);

  const getUsers = () => apiGetUsers().then((r) => setUsers(r));

  useEffect(() => {
    getUsers();
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
              <td>
                <button
                  onClick={() =>
                    apiRemoveUser(user.username).then(() => getUsers())
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
