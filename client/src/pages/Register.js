import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [data, setData] = useState({
    name: "", email: "", password: ""
  });

  const register = async () => {
    await api.post("/auth/register", data);
    alert("Register berhasil");
  };

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Nama"
        onChange={e => setData({...data, name: e.target.value})}
      />

      <input placeholder="Email"
        onChange={e => setData({...data, email: e.target.value})}
      />

      <input type="password" placeholder="Password"
        onChange={e => setData({...data, password: e.target.value})}
      />

      <button onClick={register}>Register</button>
    </div>
  );
}
