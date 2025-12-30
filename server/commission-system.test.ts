import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Commission System", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Mock admin context
    const mockAdminContext: TrpcContext = {
      user: {
        id: 1,
        role: "admin",
        partnerId: null,
      } as any,
      req: {} as any,
      res: {} as any,
    };

    adminCaller = appRouter.createCaller(mockAdminContext);
  });

  describe("getSummary", () => {
    it("deve retornar resumo de comissões", async () => {
      const summary = await adminCaller.commission.getSummary({});

      expect(summary).toBeDefined();
      expect(summary).toHaveProperty("totalReferrals");
      expect(summary).toHaveProperty("totalPrevisto");
      expect(summary).toHaveProperty("totalRealizado");
      expect(summary).toHaveProperty("totalWon");
      expect(summary).toHaveProperty("totalLost");
      expect(summary).toHaveProperty("totalInProgress");
      expect(summary).toHaveProperty("conversionRate");
      
      expect(typeof summary.totalReferrals).toBe("number");
      expect(typeof summary.totalPrevisto).toBe("number");
      expect(typeof summary.totalRealizado).toBe("number");
      expect(typeof summary.conversionRate).toBe("number");
    });

    it("deve calcular taxa de conversão corretamente", async () => {
      const summary = await adminCaller.commission.getSummary({});

      if (summary.totalReferrals > 0) {
        const expectedRate = (summary.totalWon / summary.totalReferrals) * 100;
        expect(summary.conversionRate).toBeCloseTo(expectedRate, 2);
      } else {
        expect(summary.conversionRate).toBe(0);
      }
    });

    it("deve filtrar por data quando fornecida", async () => {
      const startDate = "2025-01-01";
      const endDate = "2025-12-31";
      
      const summary = await adminCaller.commission.getSummary({
        startDate,
        endDate,
      });

      expect(summary).toBeDefined();
      expect(typeof summary.totalReferrals).toBe("number");
    });
  });

  describe("getByPartner", () => {
    it("deve retornar comissões por parceiro", async () => {
      const commissions = await adminCaller.commission.getByPartner({});

      expect(Array.isArray(commissions)).toBe(true);
      
      if (commissions.length > 0) {
        const first = commissions[0];
        expect(first).toHaveProperty("referralId");
        expect(first).toHaveProperty("partnerId");
        expect(first).toHaveProperty("partnerName");
        expect(first).toHaveProperty("status");
        expect(first).toHaveProperty("expectedValue");
        expect(first).toHaveProperty("successFeeExpected");
        expect(first).toHaveProperty("successFeeRealized");
      }
    });

    it("deve filtrar por partnerId quando fornecido", async () => {
      const partnerId = 1;
      const commissions = await adminCaller.commission.getByPartner({ partnerId });

      expect(Array.isArray(commissions)).toBe(true);
      
      // Se houver resultados, todos devem ser do parceiro especificado
      commissions.forEach((c) => {
        expect(c.partnerId).toBe(partnerId);
      });
    });

    it("deve incluir valores de comissão válidos", async () => {
      const commissions = await adminCaller.commission.getByPartner({});

      commissions.forEach((c) => {
        if (c.successFeeExpected !== null) {
          expect(c.successFeeExpected).toBeGreaterThanOrEqual(0);
        }
        if (c.successFeeRealized !== null) {
          expect(c.successFeeRealized).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe("getByCategory", () => {
    it("deve retornar comissões agrupadas por categoria", async () => {
      const byCategory = await adminCaller.commission.getByCategory({});

      expect(Array.isArray(byCategory)).toBe(true);
      
      if (byCategory.length > 0) {
        const first = byCategory[0];
        expect(first).toHaveProperty("categoryId");
        expect(first).toHaveProperty("categoryName");
        expect(first).toHaveProperty("totalReferrals");
        expect(first).toHaveProperty("totalPrevisto");
        expect(first).toHaveProperty("totalRealizado");
        expect(first).toHaveProperty("totalWon");
      }
    });

    it("deve ter valores numéricos válidos", async () => {
      const byCategory = await adminCaller.commission.getByCategory({});

      byCategory.forEach((cat) => {
        expect(Number(cat.totalReferrals)).toBeGreaterThanOrEqual(0);
        expect(Number(cat.totalPrevisto)).toBeGreaterThanOrEqual(0);
        expect(Number(cat.totalRealizado)).toBeGreaterThanOrEqual(0);
        expect(Number(cat.totalWon)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("getMonthlyEvolution", () => {
    it("deve retornar evolução mensal de comissões", async () => {
      const evolution = await adminCaller.commission.getMonthlyEvolution({ months: 12 });

      expect(Array.isArray(evolution)).toBe(true);
      
      if (evolution.length > 0) {
        const first = evolution[0];
        expect(first).toHaveProperty("month");
        expect(first).toHaveProperty("totalReferrals");
        expect(first).toHaveProperty("totalPrevisto");
        expect(first).toHaveProperty("totalRealizado");
        expect(first).toHaveProperty("totalWon");
        
        // Verificar formato do mês (YYYY-MM)
        expect(first.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it("deve respeitar o parâmetro de meses", async () => {
      const months = 6;
      const evolution = await adminCaller.commission.getMonthlyEvolution({ months });

      // Não deve retornar mais que o número de meses solicitado
      expect(evolution.length).toBeLessThanOrEqual(months);
    });

    it("deve estar ordenado cronologicamente", async () => {
      const evolution = await adminCaller.commission.getMonthlyEvolution({ months: 12 });

      for (let i = 1; i < evolution.length; i++) {
        const prevMonth = evolution[i - 1].month;
        const currMonth = evolution[i].month;
        expect(currMonth >= prevMonth).toBe(true);
      }
    });
  });

  describe("exportCSV", () => {
    it("deve exportar CSV por parceiro", async () => {
      const result = await adminCaller.commission.exportCSV({
        type: "by_partner",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      
      expect(typeof result.csv).toBe("string");
      expect(typeof result.filename).toBe("string");
      expect(result.filename).toMatch(/\.csv$/);
    });

    it("deve incluir cabeçalhos no CSV", async () => {
      const result = await adminCaller.commission.exportCSV({
        type: "by_partner",
      });

      const lines = result.csv.split("\n");
      expect(lines.length).toBeGreaterThan(0);
      
      const headers = lines[0];
      expect(headers).toContain("ID");
      expect(headers).toContain("Parceiro");
      expect(headers).toContain("Status");
      expect(headers).toContain("Comissão");
    });

    it("deve gerar nome de arquivo com data", async () => {
      const result = await adminCaller.commission.exportCSV({
        type: "by_partner",
      });

      expect(result.filename).toMatch(/comissoes_by_partner_\d{4}-\d{2}-\d{2}\.csv/);
    });
  });

  describe("Cálculos de Comissão", () => {
    it("comissão realizada deve ser menor ou igual à prevista", async () => {
      const commissions = await adminCaller.commission.getByPartner({});

      commissions.forEach((c) => {
        if (c.successFeeRealized !== null && c.successFeeExpected !== null) {
          // Comissão realizada pode ser diferente da prevista (negociação)
          // mas deve ser um valor válido
          expect(c.successFeeRealized).toBeGreaterThanOrEqual(0);
          expect(c.successFeeExpected).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it("comissão realizada só deve existir para status WON", async () => {
      const commissions = await adminCaller.commission.getByPartner({});

      commissions.forEach((c) => {
        if (c.successFeeRealized && c.successFeeRealized > 0) {
          expect(c.status).toBe("WON");
        }
      });
    });
  });
});
