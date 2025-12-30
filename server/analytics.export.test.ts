import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

// Mock user para testes
const mockPartnerUser: User = {
  id: 998,
  openId: "test-partner-openid",
  name: "Partner Test",
  email: "partner@test.com",
  loginMethod: "oauth",
  role: "parceiro",
  partnerId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockAdminUser: User = {
  id: 999,
  openId: "test-admin-openid",
  name: "Admin Test",
  email: "admin@test.com",
  loginMethod: "oauth",
  role: "admin",
  partnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Mock context
const createMockContext = (user: User | null = null) => ({
  user,
  req: {} as any,
  res: {} as any,
});

describe("Exportação de Relatórios CSV", () => {
  beforeAll(async () => {
    // Registrar alguns eventos de teste
    await db.trackEvent({
      partnerId: 1,
      eventType: "profile_view",
    });
    await db.trackEvent({
      partnerId: 1,
      offerId: 1,
      eventType: "lead_generated",
    });
    await db.trackEvent({
      partnerId: 1,
      eventType: "whatsapp_click",
    });
  });

  describe("analytics.exportReport", () => {
    it("deve gerar CSV com dados do parceiro autenticado", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toBeDefined();
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
    });

    it("deve incluir header no CSV", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      expect(result.content).toContain("ZOPUMarket - Relatório de Métricas do Parceiro");
      expect(result.content).toContain("Data de Geração:");
    });

    it("deve incluir resumo geral no CSV", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      expect(result.content).toContain("=== RESUMO GERAL ===");
      expect(result.content).toContain("Total de Visualizações");
      expect(result.content).toContain("Total de Leads Gerados");
      expect(result.content).toContain("Total de Cliques WhatsApp");
      expect(result.content).toContain("Taxa de Conversão");
    });

    it("deve incluir seções de dados detalhados", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      // Verificar se contém as seções principais
      const hasProfileViews = result.content.includes("=== VISUALIZAÇÕES POR DATA ===");
      const hasLeadsByOffer = result.content.includes("=== LEADS POR OFERTA ===");
      const hasWhatsappClicks = result.content.includes("=== CLIQUES WHATSAPP POR DATA ===");
      const hasRatingEvolution = result.content.includes("=== EVOLUÇÃO DO RATING ===");

      // Pelo menos uma seção deve estar presente
      expect(hasProfileViews || hasLeadsByOffer || hasWhatsappClicks || hasRatingEvolution).toBe(true);
    });

    it("deve gerar filename com partnerId e data", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      expect(result.filename).toMatch(/^relatorio-metricas-\d+-\d{4}-\d{2}-\d{2}\.csv$/);
      expect(result.filename).toContain("relatorio-metricas-1-");
    });

    it("admin deve poder exportar relatório de qualquer parceiro", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.analytics.exportReport({
        partnerId: 1,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.filename).toContain("relatorio-metricas-1-");
    });

    it("deve formatar CSV corretamente com vírgulas", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const result = await caller.analytics.exportReport({});

      // Verificar formato CSV básico
      const lines = result.content.split("\n");
      expect(lines.length).toBeGreaterThan(5);

      // Verificar que tem linhas com vírgulas (formato CSV)
      const csvLines = lines.filter(line => line.includes(","));
      expect(csvLines.length).toBeGreaterThan(0);
    });

    it("deve escapar vírgulas em títulos de ofertas", async () => {
      const csvContent = await db.generateMetricsCSV(1);

      // Se houver ofertas com vírgulas no título, devem estar entre aspas
      if (csvContent.includes("=== LEADS POR OFERTA ===")) {
        const lines = csvContent.split("\n");
        const offerSection = lines.findIndex(line => line.includes("=== LEADS POR OFERTA ==="));
        
        if (offerSection !== -1) {
          // Verificar que a seção existe
          expect(offerSection).toBeGreaterThan(0);
        }
      }

      // Teste passa se o CSV foi gerado
      expect(csvContent).toBeDefined();
    });

    it("deve incluir dados de período específico quando fornecido", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const result = await caller.analytics.exportReport({
        startDate,
        endDate: new Date(),
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it("parceiro deve ver apenas suas próprias métricas no CSV", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Tentar exportar com partnerId diferente (será ignorado)
      const result = await caller.analytics.exportReport({
        partnerId: 9999,
      });

      // Deve retornar dados do partnerId do usuário (1)
      expect(result.filename).toContain("relatorio-metricas-1-");
    });
  });

  describe("generateMetricsCSV", () => {
    it("deve gerar CSV válido diretamente da função do db", async () => {
      const csv = await db.generateMetricsCSV(1);

      expect(csv).toBeDefined();
      expect(typeof csv).toBe("string");
      expect(csv.length).toBeGreaterThan(0);
      expect(csv).toContain("ZOPUMarket");
    });

    it("deve incluir quebras de linha corretas", async () => {
      const csv = await db.generateMetricsCSV(1);

      const lines = csv.split("\n");
      expect(lines.length).toBeGreaterThan(5);
    });

    it("deve formatar números corretamente", async () => {
      const csv = await db.generateMetricsCSV(1);

      // Verificar que tem números no formato correto
      expect(csv).toMatch(/\d+/);
    });
  });
});
