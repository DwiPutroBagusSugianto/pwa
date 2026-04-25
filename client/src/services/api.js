import axios from "axios";

const API = axios.create({
  baseURL: "http://103.217.218.230:5000"
});

export default API;
