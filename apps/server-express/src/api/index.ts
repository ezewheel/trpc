import { Router } from "express";
import { z } from "zod";

type User = { id: number; name: string; email: string; age: number };

const users: User[] = [];

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(18),
});

export const api = Router();

api.post("/createUser", (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const user = { id: users.length + 1, ...parsed.data };
  users.push(user);

  res.status(201).json(user);
});
