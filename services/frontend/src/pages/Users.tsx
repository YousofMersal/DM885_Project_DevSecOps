import React, { useEffect } from "react";
import { apiGetUsers } from "../request";

interface IUsersProps {}

export const Users: React.FC<IUsersProps> = () => {
  useEffect(() => {
    apiGetUsers().then((r) => console.log("r", r));
  }, []);

  return <div></div>;
};
