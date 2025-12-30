import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Rota para iniciar o fluxo OAuth
  app.get("/api/oauth/login", async (req: Request, res: Response) => {
    try {
      const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL || "https://oauth.manus.im";
      const appId = process.env.VITE_APP_ID;
      
      if (!appId) {
        console.error("[OAuth] ERROR: VITE_APP_ID not configured");
        res.status(500).json({ error: "OAuth not configured" });
        return;
      }
      
      // Construir URL de callback
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const callbackUrl = `${protocol}://${host}/api/oauth/callback`;
      const state = Buffer.from(callbackUrl).toString('base64');
      
      // Redirecionar para portal OAuth do Manus
      const authUrl = `${oauthPortalUrl}/authorize?app_id=${appId}&state=${state}`;
      
      console.log("[OAuth] Redirecting to:", authUrl);
      res.redirect(302, authUrl);
    } catch (error) {
      console.error("[OAuth] Login failed", error);
      res.status(500).json({ error: "OAuth login failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
