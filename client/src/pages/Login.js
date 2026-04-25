import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });

  const login = async () => {
    const res = await api.post("/auth/login", data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    window.location.href = "/";
  };

  return (
    <div>
      <h2>Login</h2>

      <input placeholder="Email"
        onChange={e => setData({...data, email: e.target.value})}
      />

      <input type="password" placeholder="Password"
        onChange={e => setData({...data, password: e.target.value})}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
