import { useState } from "react";
import api from "../services/api";

export default function Apply() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();
    formData.append("cv", file);

    await api.post("/upload-cv", formData);
    alert("CV uploaded");
  };

  return (
    <div>
      <h2>Apply</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <button onClick={upload}>Upload CV</button>
    </div>
  );
}
