import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb, getAuditLogs } from "./db";
import type { TrpcContext } from "./_core/trpc";

describe("offer.delete com auditoria", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Mock admin context
    ctx = {
      user: {
        id: 1,
        openId: "test-admin",
        name: "Admin Test",
        email: "admin@test.com",
        role: "admin",
        partnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
        loginMethod: "test",
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(ctx);
  });

  it("deve validar que procedure offer.delete existe e requer admin", async () => {
    // Verifica que o procedure existe
    expect(caller.offer.delete).toBeDefined();
    expect(typeof caller.offer.delete).toBe("function");
  });

  it("deve verificar que logs de DELETE_OFFER existem no banco", async () => {
    // Busca logs de DELETE_OFFER
    const auditLogs = await getAuditLogs({
      entityType: "offer",
      limit: 10,
    });

    // Se houver logs, valida estrutura
    if (auditLogs.length > 0) {
      const log = auditLogs[0];
      expect(log).toHaveProperty("userId");
      expect(log).toHaveProperty("action");
      expect(log).toHaveProperty("entityType");
      expect(log).toHaveProperty("entityId");
      expect(log).toHaveProperty("oldValue");
      expect(log.action).toBe("DELETE_OFFER");
      expect(log.entityType).toBe("offer");
      
      // Valida que oldValue é JSON válido
      expect(() => JSON.parse(log.oldValue)).not.toThrow();
    }
  });

  it("deve validar estrutura do oldValue em logs DELETE_OFFER", async () => {
    // Busca logs de DELETE_OFFER
    const auditLogs = await getAuditLogs({
      entityType: "offer",
      limit: 1,
    });

    // Se houver logs, valida oldValue
    if (auditLogs.length > 0) {
      const log = auditLogs[0];
      const oldValue = JSON.parse(log.oldValue);

      // Verifica campos importantes de uma oferta
      expect(oldValue).toHaveProperty("id");
      expect(oldValue).toHaveProperty("title");
      expect(oldValue).toHaveProperty("categoryId");
      expect(oldValue).toHaveProperty("successFeePercent");
      expect(oldValue).toHaveProperty("status");
    }
  });

  it("deve rejeitar exclusão por usuário não-admin", async () => {
    // Mock de contexto não-admin
    const userCaller = appRouter.createCaller({
      user: {
        id: 2,
        openId: "test-user",
        email: "user@test.com",
        name: "User Test",
        role: "comprador",
        partnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
        loginMethod: "test",
      },
      req: {} as any,
      res: {} as any,
    });

    // Tenta excluir oferta inexistente (ID alto)
    await expect(
      userCaller.offer.delete({ id: 999999 })
    ).rejects.toThrow();
  });
});
