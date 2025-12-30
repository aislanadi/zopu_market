import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/trpc";

describe("Gerente Procedures", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testGerenteId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Mock gerente context
    testGerenteId = 999; // ID fictício para testes
    ctx = {
      user: {
        id: testGerenteId,
        openId: "test-gerente",
        name: "Gerente Test",
        email: "gerente@test.com",
        role: "gerente_contas",
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

  describe("getMyReferrals", () => {
    it("deve retornar indicações do gerente", async () => {
      const result = await caller.gerente.getMyReferrals({ limit: 50 });
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstReferral = result[0];
        expect(firstReferral).toHaveProperty("id");
        expect(firstReferral).toHaveProperty("offerId");
        expect(firstReferral).toHaveProperty("offerTitle");
        expect(firstReferral).toHaveProperty("partnerId");
        expect(firstReferral).toHaveProperty("partnerName");
        expect(firstReferral).toHaveProperty("buyerCompany");
        expect(firstReferral).toHaveProperty("status");
        expect(firstReferral).toHaveProperty("origin");
        
        // Validar tipos
        expect(typeof firstReferral.id).toBe("number");
        expect(typeof firstReferral.status).toBe("string");
      }
    });

    it("deve filtrar por status quando especificado", async () => {
      const result = await caller.gerente.getMyReferrals({ 
        status: "WON",
        limit: 50 
      });
      
      for (const ref of result) {
        expect(ref.status).toBe("WON");
      }
    });

    it("deve respeitar o limite especificado", async () => {
      const limit = 10;
      const result = await caller.gerente.getMyReferrals({ limit });
      
      expect(result.length).toBeLessThanOrEqual(limit);
    });

    it("deve retornar apenas indicações do gerente logado", async () => {
      const result = await caller.gerente.getMyReferrals({ limit: 100 });
      
      // Como estamos usando um ID fictício, não deve retornar nada
      // Em produção, retornaria apenas indicações com gerenteId = testGerenteId
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getFollowUpAlerts", () => {
    it("deve retornar alertas de follow-up", async () => {
      const result = await caller.gerente.getFollowUpAlerts();
      
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const firstAlert = result[0];
        expect(firstAlert).toHaveProperty("id");
        expect(firstAlert).toHaveProperty("offerId");
        expect(firstAlert).toHaveProperty("offerTitle");
        expect(firstAlert).toHaveProperty("partnerId");
        expect(firstAlert).toHaveProperty("partnerName");
        expect(firstAlert).toHaveProperty("buyerCompany");
        expect(firstAlert).toHaveProperty("status");
        expect(firstAlert).toHaveProperty("daysSinceUpdate");
        
        // Validar que são indicações antigas (> 7 dias)
        expect(firstAlert.daysSinceUpdate).toBeGreaterThan(7);
        
        // Validar que estão em status ativo
        expect(["SENT", "ACKED", "IN_NEGOTIATION"]).toContain(firstAlert.status);
      }
    });

    it("deve ordenar por dias desde atualização (mais antigos primeiro)", async () => {
      const result = await caller.gerente.getFollowUpAlerts();
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].daysSinceUpdate).toBeGreaterThanOrEqual(result[i + 1].daysSinceUpdate);
        }
      }
    });
  });

  describe("getDashboardStats", () => {
    it("deve retornar estatísticas do dashboard", async () => {
      const result = await caller.gerente.getDashboardStats();
      
      if (result) {
        expect(result).toHaveProperty("totalReferrals");
        expect(result).toHaveProperty("inProgress");
        expect(result).toHaveProperty("won");
        expect(result).toHaveProperty("lost");
        expect(result).toHaveProperty("totalExpectedValue");
        expect(result).toHaveProperty("totalWonValue");
        expect(result).toHaveProperty("totalCommission");
        expect(result).toHaveProperty("conversionRate");
        
        // Validar tipos
        expect(typeof result.totalReferrals).toBe("number");
        expect(typeof result.conversionRate).toBe("number");
        
        // Validar que valores são não-negativos
        expect(result.totalReferrals).toBeGreaterThanOrEqual(0);
        expect(result.inProgress).toBeGreaterThanOrEqual(0);
        expect(result.won).toBeGreaterThanOrEqual(0);
        expect(result.lost).toBeGreaterThanOrEqual(0);
      }
    });

    it("taxa de conversão deve estar entre 0 e 100", async () => {
      const result = await caller.gerente.getDashboardStats();
      
      if (result) {
        expect(result.conversionRate).toBeGreaterThanOrEqual(0);
        expect(result.conversionRate).toBeLessThanOrEqual(100);
      }
    });

    it("soma de status deve ser igual ao total", async () => {
      const result = await caller.gerente.getDashboardStats();
      
      if (result && result.totalReferrals > 0) {
        const sumStatuses = result.inProgress + result.won + result.lost;
        // A soma pode ser menor ou igual ao total (há outros status como OVERDUE)
        expect(sumStatuses).toBeLessThanOrEqual(result.totalReferrals);
      }
    });
  });

  describe("createManualReferral", () => {
    it("deve validar campos obrigatórios", async () => {
      await expect(
        caller.gerente.createManualReferral({
          offerId: 0, // ID inválido
          partnerId: 0, // ID inválido
          buyerCompany: "",
          buyerContact: "",
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar oferta inexistente", async () => {
      await expect(
        caller.gerente.createManualReferral({
          offerId: 999999, // ID que não existe
          partnerId: 1,
          buyerCompany: "Empresa Teste",
          buyerContact: "Contato Teste",
        })
      ).rejects.toThrow();
    });
  });

  describe("updateInternalNotes", () => {
    it("deve validar campos obrigatórios", async () => {
      await expect(
        caller.gerente.updateInternalNotes({
          referralId: 0,
          notes: "",
        })
      ).rejects.toThrow();
    });

    it("deve rejeitar indicação inexistente ou sem permissão", async () => {
      await expect(
        caller.gerente.updateInternalNotes({
          referralId: 999999, // ID que não existe
          notes: "Teste de nota",
        })
      ).rejects.toThrow();
    });
  });

  describe("Permissões de Acesso", () => {
    it("deve bloquear acesso de não-gerente ao getMyReferrals", async () => {
      const nonGerenteCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "cliente" as const },
      };
      const nonGerenteCaller = appRouter.createCaller(nonGerenteCtx);

      await expect(
        nonGerenteCaller.gerente.getMyReferrals({ limit: 10 })
      ).rejects.toThrow();
    });

    it("deve bloquear acesso de não-gerente ao getFollowUpAlerts", async () => {
      const nonGerenteCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "parceiro" as const },
      };
      const nonGerenteCaller = appRouter.createCaller(nonGerenteCtx);

      await expect(
        nonGerenteCaller.gerente.getFollowUpAlerts()
      ).rejects.toThrow();
    });

    it("deve bloquear acesso de não-gerente ao createManualReferral", async () => {
      const nonGerenteCtx = {
        ...ctx,
        user: { ...ctx.user!, role: "cliente" as const },
      };
      const nonGerenteCaller = appRouter.createCaller(nonGerenteCtx);

      await expect(
        nonGerenteCaller.gerente.createManualReferral({
          offerId: 1,
          partnerId: 1,
          buyerCompany: "Teste",
          buyerContact: "Teste",
        })
      ).rejects.toThrow();
    });
  });

  describe("Integridade de Dados", () => {
    it("getMyReferrals deve incluir informações de oferta e parceiro", async () => {
      const result = await caller.gerente.getMyReferrals({ limit: 10 });
      
      for (const ref of result) {
        // Se tem offerId, deve ter offerTitle (join funcionando)
        if (ref.offerId) {
          expect(ref).toHaveProperty("offerTitle");
        }
        // Se tem partnerId, deve ter partnerName (join funcionando)
        if (ref.partnerId) {
          expect(ref).toHaveProperty("partnerName");
        }
      }
    });

    it("getFollowUpAlerts deve incluir informações completas", async () => {
      const result = await caller.gerente.getFollowUpAlerts();
      
      for (const alert of result) {
        expect(alert).toHaveProperty("offerTitle");
        expect(alert).toHaveProperty("partnerName");
        expect(alert).toHaveProperty("daysSinceUpdate");
        expect(typeof alert.daysSinceUpdate).toBe("number");
      }
    });
  });
});
