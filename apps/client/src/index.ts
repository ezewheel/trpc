import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "server/api";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3005/trpc",
    }),
  ],
});

const user = await client.createUser.mutate({
  name: "Ana",
  email: "ana@mail.com",
  age: 28,

  // Si falta un campo o tiene un tipo incorrecto,
  // TypeScript detecta el error y no compila.
});

console.log("Creado:", user);
console.log(user.name);

// No necesitamos definir una interfaz User en el cliente.
// El tipo de la respuesta se obtiene automáticamente de AppRouter.
