import express from "express";
import { api } from "./api";

const app = express();

app.use(express.json());

const PORT = 3002;

app.use(api);

app.listen(PORT, () => {
  console.log(`Express (sin tRPC) en http://localhost:${PORT}`);
});
