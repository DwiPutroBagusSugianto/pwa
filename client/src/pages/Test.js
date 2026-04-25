import { useEffect, useState } from "react";
import api from "../services/api";

export default function Test() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(600);

  useEffect(() => {
    api.get("/test/questions").then(res => setQuestions(res.data));
  }, []);

  useEffect(() => {
    if (time <= 0) submit();

    const interval = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const submit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await api.post("/test/submit", {
      answers,
      user_id: user.id
    });

    alert("Score: " + res.data.score);
  };

  return (
    <div>
      <h2>Psikotes</h2>
      <p>Time: {time}s</p>

      {/* Progress */}
      <div style={{
        width: "100%",
        background: "#ccc",
        height: "10px"
      }}>
        <div style={{
          width: `${(Object.keys(answers).length / questions.length) * 100}%`,
          background: "green",
          height: "10px"
        }} />
      </div>

      {questions.map((q, i) => (
        <div key={q.id}>
          <p>{i+1}. {q.question}</p>

          {["a","b","c","d"].map(opt => (
            <button key={opt}
              onClick={() =>
                setAnswers({...answers, [q.id]: opt})
              }>
              {q["option_"+opt]}
            </button>
          ))}
        </div>
      ))}

      <button onClick={submit}>Submit</button>
    </div>
  );
}
