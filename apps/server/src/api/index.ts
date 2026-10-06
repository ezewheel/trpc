import { z } from "zod";
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

type User = { id: number; name: string; email: string; age: number };
const users: User[] = [];

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
      const user: User = { id: users.length + 1, ...input };
      users.push(user);
      return user;
    }),
});

export type AppRouter = typeof appRouter;
