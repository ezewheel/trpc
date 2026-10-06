import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const users: User[] = [];

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
};

export const appRouter = t.router({
  createUser: t.procedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        age: z.number().int().min(18),
      }),
    )
    .mutation(({ input }) => {
      const user: User = {
        id: users.length + 1,
        ...input,
      };

      users.push(user);
      return user;
    }),
});

// el cliente importa este tipo, conoce la estructura de la API
export type AppRouter = typeof appRouter;
