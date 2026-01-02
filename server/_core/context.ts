import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret);

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Authenticate via local JWT token (email/password login)
 */
async function authenticateLocalToken(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    if (!userId) return null;

    // Fetch user from database
    const db = await getDb();
    if (!db) return null;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return user || null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Authenticate using local JWT token
  const user = await authenticateLocalToken(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
