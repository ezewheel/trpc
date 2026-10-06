import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./api";

const server = createHTTPServer({
  basePath: "/trpc/",
  router: appRouter,
});

server.listen(3001);
console.log("Servidor tRPC en http://localhost:3001");
