import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "server/api";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3001" })],
});

const user = await client.createUser.mutate({
  name: "Ana", // sin el 'name' no compila
  email: "ana@mail.com",
  age: 28,
});

console.log("Creado:", user);
console.log(user.name);
