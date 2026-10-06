// ═══════════════════════════════════════════════════════════════════
// Arranque del server. Espejo de apps/server/src/index.ts: acá solo se
// levanta el servidor y se monta la API. La API vive en ./api.
// ═══════════════════════════════════════════════════════════════════

import express from "express";
import { api } from "./api";

const app = express();

// PROBLEMA 1: Express NO lee req.body. Hay que pedirlo explícitamente.
// tRPC lo hace internamente, sin esta línea.
app.use(express.json());

// 3001 lo usa el server de tRPC, así los dos pueden convivir.
const PORT = 3002;

app.use(api);

app.listen(PORT, () => {
  console.log(`Express (sin tRPC) en http://localhost:${PORT}`);
});
