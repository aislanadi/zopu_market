import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/trpc";

describe("Admin Dashboard Procedures", () => {
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

  describe("getLeadsByCategory", () => {
    it("deve retornar leads agrupados por categoria", async () => {
      const result = await caller.adminDashboard.getLeadsByCategory();
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstCategory = result[0];
        expect(firstCategory).toHaveProperty("categoryId");
        expect(firstCategory).toHaveProperty("categoryName");
        expect(firstCategory).toHaveProperty("totalLeads");
        expect(firstCategory).toHaveProperty("leadsWon");
        expect(firstCategory).toHaveProperty("leadsLost");
        expect(firstCategory).toHaveProperty("leadsInProgress");
        expect(firstCategory).toHaveProperty("totalValue");
        expect(firstCategory).toHaveProperty("wonValue");
        
        // Validar tipos
        expect(typeof firstCategory.totalLeads).toBe("number");
        expect(typeof firstCategory.leadsWon).toBe("number");
        expect(typeof firstCategory.leadsLost).toBe("number");
        expect(typeof firstCategory.leadsInProgress).toBe("number");
      }
    });

    it("deve retornar array vazio se não houver dados", async () => {
      const result = await caller.adminDashboard.getLeadsByCategory();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getAgingReport", () => {
    it("deve retornar relatório de aging com buckets", async () => {
      const result = await caller.adminDashboard.getAgingReport();
      
      expect(result).toHaveProperty("buckets");
      expect(result).toHaveProperty("total");
      expect(Array.isArray(result.buckets)).toBe(true);
      expect(typeof result.total).toBe("number");
      
      // Verificar estrutura dos buckets
      if (result.buckets.length > 0) {
        const firstBucket = result.buckets[0];
        expect(firstBucket).toHaveProperty("range");
        expect(firstBucket).toHaveProperty("count");
        expect(typeof firstBucket.range).toBe("string");
        expect(typeof firstBucket.count).toBe("number");
      }
    });

    it("deve ter exatamente 4 buckets de aging", async () => {
      const result = await caller.adminDashboard.getAgingReport();
      
      // Sempre deve retornar 4 buckets, mesmo que com count 0
      expect(result.buckets.length).toBe(4);
      
      const ranges = result.buckets.map(b => b.range);
      expect(ranges).toContain("0-7 dias");
      expect(ranges).toContain("8-15 dias");
      expect(ranges).toContain("16-30 dias");
      expect(ranges).toContain("30+ dias");
    });

    it("soma dos buckets deve ser igual ao total", async () => {
      const result = await caller.adminDashboard.getAgingReport();
      
      const sumBuckets = result.buckets.reduce((acc, b) => acc + b.count, 0);
      expect(sumBuckets).toBe(result.total);
    });
  });

  describe("getConversionRanking", () => {
    it("deve retornar ranking de conversão de parceiros", async () => {
      const result = await caller.adminDashboard.getConversionRanking({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstPartner = result[0];
        expect(firstPartner).toHaveProperty("partnerId");
        expect(firstPartner).toHaveProperty("partnerName");
        expect(firstPartner).toHaveProperty("totalLeads");
        expect(firstPartner).toHaveProperty("leadsWon");
        expect(firstPartner).toHaveProperty("leadsLost");
        expect(firstPartner).toHaveProperty("conversionRate");
        expect(firstPartner).toHaveProperty("totalCommission");
        
        // Validar tipos
        expect(typeof firstPartner.partnerId).toBe("number");
        expect(typeof firstPartner.partnerName).toBe("string");
        expect(typeof firstPartner.totalLeads).toBe("number");
        expect(typeof firstPartner.conversionRate).toBe("number");
      }
    });

    it("deve respeitar o limite especificado", async () => {
      const limit = 5;
      const result = await caller.adminDashboard.getConversionRanking({ limit });
      
      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it("deve ordenar por taxa de conversão decrescente", async () => {
      const result = await caller.adminDashboard.getConversionRanking({ limit: 20 });
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].conversionRate).toBeGreaterThanOrEqual(result[i + 1].conversionRate);
        }
      }
    });

    it("taxa de conversão deve estar entre 0 e 100", async () => {
      const result = await caller.adminDashboard.getConversionRanking({ limit: 20 });
      
      for (const partner of result) {
        expect(partner.conversionRate).toBeGreaterThanOrEqual(0);
        expect(partner.conversionRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("getAuditLogs", () => {
    it("deve retornar logs de auditoria", async () => {
      const result = await caller.adminDashboard.getAuditLogs({ limit: 50 });
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstLog = result[0];
        expect(firstLog).toHaveProperty("id");
        expect(firstLog).toHaveProperty("userId");
        expect(firstLog).toHaveProperty("action");
        expect(firstLog).toHaveProperty("createdAt");
        
        // Validar tipos
        expect(typeof firstLog.id).toBe("number");
        expect(typeof firstLog.userId).toBe("number");
        expect(typeof firstLog.action).toBe("string");
      }
    });

    it("deve respeitar o limite especificado", async () => {
      const limit = 10;
      const result = await caller.adminDashboard.getAuditLogs({ limit });
      
      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it("deve filtrar por entityType quando especificado", async () => {
      const entityType = "OFFER";
      const result = await caller.adminDashboard.getAuditLogs({ 
        limit: 100, 
        entityType 
      });
      
      for (const log of result) {
        if (log.entityType) {
          expect(log.entityType).toBe(entityType);
        }
      }
    });

    it("deve ordenar por data decrescente (mais recente primeiro)", async () => {
      const result = await caller.adminDashboard.getAuditLogs({ limit: 50 });
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const date1 = new Date(result[i].createdAt!).getTime();
          const date2 = new Date(result[i + 1].createdAt!).getTime();
          expect(date1).toBeGreaterThanOrEqual(date2);
        }
      }
    });
  });

  describe("Permissões de Acesso", () => {
    it("deve bloquear acesso de não-admin ao getLeadsByCategory", async () => {
      const nonAdminCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "parceiro" as const },
      };
      const nonAdminCaller = appRouter.createCaller(nonAdminCtx);

      await expect(
        nonAdminCaller.adminDashboard.getLeadsByCategory()
      ).rejects.toThrow();
    });

    it("deve bloquear acesso de não-admin ao getConversionRanking", async () => {
      const nonAdminCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "cliente" as const },
      };
      const nonAdminCaller = appRouter.createCaller(nonAdminCtx);

      await expect(
        nonAdminCaller.adminDashboard.getConversionRanking({ limit: 10 })
      ).rejects.toThrow();
    });

    it("deve bloquear acesso de não-admin ao getAuditLogs", async () => {
      const nonAdminCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "gerente_contas" as const },
      };
      const nonAdminCaller = appRouter.createCaller(nonAdminCtx);

      await expect(
        nonAdminCaller.adminDashboard.getAuditLogs({ limit: 10 })
      ).rejects.toThrow();
    });
  });
});
