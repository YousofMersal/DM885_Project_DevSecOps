import { useState } from "react";

function App() {
  const login = () => {
    fetch("http://localhost:3000/users/login", {
      method: "POST",
      body: JSON.stringify({
        username: "cooldad",
        password: "cool42",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  return (
    <div>
      <h1>A barebones example</h1>
      <button onClick={login}>Log in</button>
    </div>
  );
}

export default App;
