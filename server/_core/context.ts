import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
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
    console.log("[Auth Debug] Cookie name:", COOKIE_NAME);
    console.log("[Auth Debug] All cookies:", req.cookies);
    console.log("[Auth Debug] Token found:", token ? "YES" : "NO");
    if (!token) return null;

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    if (!userId) return null;

    // Fetch user from database
    const db = await getDb();
    if (!db) return null;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    console.log("[Auth Debug] User found:", user ? `YES (id: ${user.id}, email: ${user.email})` : "NO");
    return user || null;
  } catch (error) {
    console.log("[Auth Debug] Error:", error);
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log("[Context] Creating context for:", opts.req.method, opts.req.url);
  console.log("[Context] Cookies:", opts.req.cookies);
  console.log("[Context] Headers:", opts.req.headers.cookie);

  // Try local authentication first (JWT token from email/password login)
  user = await authenticateLocalToken(opts.req);
  
  if (user) {
    console.log("[Context] Local auth SUCCESS:", { id: user.id, email: user.email, role: user.role });
  } else {
    console.log("[Context] Local auth FAILED, trying OAuth...");
  }

  // Fallback to OAuth authentication if local auth failed
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
      if (user) {
        console.log("[Context] OAuth auth SUCCESS:", { id: user.id, email: user.email, role: user.role });
      }
    } catch (error) {
      console.log("[Context] OAuth auth FAILED:", error);
      // Authentication is optional for public procedures.
      user = null;
    }
  }
  
  if (!user) {
    console.log("[Context] NO USER AUTHENTICATED");
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
