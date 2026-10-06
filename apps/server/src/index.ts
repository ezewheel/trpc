import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./api";

const server = createHTTPServer({ router: appRouter });

server.listen(3005);
console.log("Servidor tRPC en http://localhost:3005");
