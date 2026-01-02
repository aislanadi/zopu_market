/**
 * Local authentication router (email/password)
 */

import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateTokenExpiry,
  isTokenExpired,
  isValidEmail,
  isValidPassword,
  getPasswordValidationError,
} from "./_core/localAuth";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret);
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // Reduced from 1 year for security

/**
 * Create session token for authenticated user
 */
async function createSessionToken(userId: number, email: string, name: string | null): Promise<string> {
  return await new SignJWT({
    userId,
    email,
    name: name || "",
    appId: ENV.appId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // Reduced from 365d for security
    .sign(JWT_SECRET);
}

export const localAuthRouter = router({
  /**
   * Register new user with email/password
   */
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      role: z.enum(["cliente", "parceiro"]).default("cliente"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Validate email format
      if (!isValidEmail(input.email)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email inválido" });
      }

      // Validate password strength
      const passwordError = getPasswordValidationError(input.password);
      if (passwordError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordError,
        });
      }

      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email já cadastrado" });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Generate email verification token
      const emailVerificationToken = generateToken();
      const emailVerificationExpiry = generateTokenExpiry(48); // 48 hours for email verification

      // Create user
      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        loginMethod: "email",
        emailVerified: 0,
        emailVerificationToken,
        emailVerificationExpiry,
        lastSignedIn: new Date(),
      });

      const userId = Number((result as any).insertId);

      // TODO: Send verification email
      // const { sendEmail } = await import("./_core/email");
      // await sendEmail({
      //   to: input.email,
      //   subject: "Verifique seu email - ZOPUMarket",
      //   html: `<p>Clique no link para verificar: ${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}</p>`,
      // });

      // Create session token for immediate login
      const sessionToken = await createSessionToken(userId, input.email, input.name);

      // Set HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: THIRTY_DAYS_MS,
        path: "/",
      };

      ctx.res.cookie("app_session_id", sessionToken, cookieOptions);

      return {
        success: true,
        message: "Cadastro realizado com sucesso!",
        user: {
          id: userId,
          email: input.email,
          name: input.name,
          role: input.role,
          emailVerified: false,
        },
      };
    }),

  /**
   * Login with email/password
   */
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user by email
      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (result.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
      }

      const user = result[0];

      // Check if user has password (might be OAuth-only user)
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta conta foi criada com login social. Use o botão de login social.",
        });
      }

      // Verify password
      const isValid = await verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou senha incorretos" });
      }

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      // Create session token
      const sessionToken = await createSessionToken(user.id, user.email || "", user.name);

      // Set HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: THIRTY_DAYS_MS,
        path: "/",
      };

      ctx.res.cookie("app_session_id", sessionToken, cookieOptions);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified === 1,
          partnerId: user.partnerId,
        },
      };
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user
      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      
      // Always return success (don't reveal if email exists)
      if (result.length === 0) {
        return { success: true, message: "Se o email existir, você receberá instruções para redefinir a senha" };
      }

      const user = result[0];

      // Generate reset token
      const resetToken = generateToken();
      const resetExpiry = generateTokenExpiry(2); // 2 hours for password reset

      // Save token
      await db.update(users).set({
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      }).where(eq(users.id, user.id));

      // TODO: Send reset email
      // const { sendEmail } = await import("./_core/email");
      // await sendEmail({
      //   to: input.email,
      //   subject: "Redefinir senha - ZOPUMarket",
      //   html: `<p>Clique no link para redefinir: ${process.env.FRONTEND_URL}/reset-password/${resetToken}</p>`,
      // });

      return {
        success: true,
        message: "Se o email existir, você receberá instruções para redefinir a senha",
      };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Validate password strength
      const passwordError = getPasswordValidationError(input.newPassword);
      if (passwordError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordError,
        });
      }

      // Find user by token
      const result = await db.select().from(users).where(eq(users.passwordResetToken, input.token)).limit(1);
      if (result.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token inválido ou expirado" });
      }

      const user = result[0];

      // Check if token expired
      if (isTokenExpired(user.passwordResetExpiry)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token expirado. Solicite um novo link de redefinição" });
      }

      // Hash new password
      const passwordHash = await hashPassword(input.newPassword);

      // Update password and clear reset token
      await db.update(users).set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      }).where(eq(users.id, user.id));

      return {
        success: true,
        message: "Senha redefinida com sucesso",
      };
    }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user by token
      const result = await db.select().from(users).where(eq(users.emailVerificationToken, input.token)).limit(1);
      if (result.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token inválido ou expirado" });
      }

      const user = result[0];

      // Check if already verified
      if (user.emailVerified === 1) {
        return {
          success: true,
          message: "Email já verificado",
        };
      }

      // Check if token expired
      if (isTokenExpired(user.emailVerificationExpiry)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Token expirado. Solicite um novo link de verificação" });
      }

      // Mark as verified and clear token
      await db.update(users).set({
        emailVerified: 1,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      }).where(eq(users.id, user.id));

      return {
        success: true,
        message: "Email verificado com sucesso",
      };
    }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Find user
      const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (result.length === 0) {
        // Don't reveal if email exists
        return { success: true, message: "Se o email existir, você receberá um novo link de verificação" };
      }

      const user = result[0];

      // Check if already verified
      if (user.emailVerified === 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email já verificado" });
      }

      // Generate new token
      const emailVerificationToken = generateToken();
      const emailVerificationExpiry = generateTokenExpiry(48);

      // Update token
      await db.update(users).set({
        emailVerificationToken,
        emailVerificationExpiry,
      }).where(eq(users.id, user.id));

      // TODO: Send verification email
      // const { sendEmail } = await import("./_core/email");
      // await sendEmail({
      //   to: input.email,
      //   subject: "Verifique seu email - ZOPUMarket",
      //   html: `<p>Clique no link para verificar: ${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}</p>`,
      // });

      return {
        success: true,
        message: "Se o email existir, você receberá um novo link de verificação",
      };
    }),
});
