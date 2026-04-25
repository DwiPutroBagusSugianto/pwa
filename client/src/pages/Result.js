import { useEffect, useState } from "react";
import api from "../services/api";

export default function Result() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    api.get(`/result/${user.id}`).then(res => setResult(res.data));
  }, []);

  if (!result) return <p>Loading...</p>;

  return (
    <div>
      <h2>Hasil</h2>
      <p>Nilai: {result.final_score}</p>
      <p>Status: {result.status}</p>
    </div>
  );
}
