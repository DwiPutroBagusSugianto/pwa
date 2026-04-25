import axios from "axios";

export default axios.create({
  baseURL: "http://103.217.218.230:5000"
const db = require("./config/db");

app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) return res.status(500).send(err);

    res.send("Register berhasil");
  });
});
