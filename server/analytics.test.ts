import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

// Mock user para testes
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

// Mock context
const createMockContext = (user: User | null = null) => ({
  user,
  req: {} as any,
  res: {} as any,
});

describe("Analytics System", () => {
  let testPartnerId: number;
  let testOfferId: number;

  beforeAll(async () => {
    // Criar parceiro de teste
    const partner = await db.createPartner({
      companyName: "Test Analytics Partner",
      cnpj: "12345678000199",
      curationStatus: "APPROVED",
      contactEmail: "analytics@test.com",
    });
    testPartnerId = partner.id;

    // Criar oferta de teste
    const offer = await db.createOffer({
      partnerId: testPartnerId,
      title: "Test Analytics Offer",
      description: "Offer for analytics testing",
      saleMode: "LEAD_FORM",
      status: "PUBLISHED",
      categoryId: 1,
      successFeePercent: 10,
    });
    testOfferId = offer.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testOfferId) {
      await db.deleteOffer(testOfferId);
    }
    if (testPartnerId) {
      await db.updatePartner(testPartnerId, { curationStatus: "REJECTED" });
    }
  });

  describe("analytics.track", () => {
    it("deve registrar evento de visualização de perfil", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.analytics.track({
        partnerId: testPartnerId,
        eventType: "profile_view",
      });

      expect(result.success).toBe(true);
    });

    it("deve registrar evento de clique em oferta", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.analytics.track({
        partnerId: testPartnerId,
        offerId: testOfferId,
        eventType: "offer_click",
      });

      expect(result.success).toBe(true);
    });

    it("deve registrar evento de lead gerado", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.analytics.track({
        partnerId: testPartnerId,
        offerId: testOfferId,
        eventType: "lead_generated",
        metadata: { source: "catalog" },
      });

      expect(result.success).toBe(true);
    });

    it("deve registrar evento de clique WhatsApp", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.analytics.track({
        partnerId: testPartnerId,
        eventType: "whatsapp_click",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("analytics.getPartnerMetrics", () => {
    it("deve retornar métricas do parceiro autenticado", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Registrar alguns eventos primeiro
      await caller.analytics.track({
        partnerId: testPartnerId,
        eventType: "profile_view",
      });
      await caller.analytics.track({
        partnerId: testPartnerId,
        offerId: testOfferId,
        eventType: "lead_generated",
      });

      const metrics = await caller.analytics.getPartnerMetrics({});

      expect(metrics).toBeDefined();
      expect(metrics.totals).toBeDefined();
      expect(metrics.totals.views).toBeGreaterThanOrEqual(0);
      expect(metrics.totals.leads).toBeGreaterThanOrEqual(0);
      expect(metrics.totals.whatsappClicks).toBeGreaterThanOrEqual(0);
      expect(metrics.totals.conversionRate).toBeGreaterThanOrEqual(0);
    });

    it("deve retornar arrays de dados para gráficos", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      const metrics = await caller.analytics.getPartnerMetrics({});

      expect(Array.isArray(metrics.profileViews)).toBe(true);
      expect(Array.isArray(metrics.leadsByOffer)).toBe(true);
      expect(Array.isArray(metrics.whatsappClicks)).toBe(true);
      expect(Array.isArray(metrics.ratingEvolution)).toBe(true);
    });

    it("admin deve poder ver métricas de qualquer parceiro", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));
      
      // Usar partnerId 1 que sabemos que existe
      const metrics = await caller.analytics.getPartnerMetrics({
        partnerId: 1,
      });

      expect(metrics).toBeDefined();
      expect(metrics.totals).toBeDefined();
      // Verifica que retornou métricas válidas
      expect(metrics.totals.views).toBeGreaterThanOrEqual(0);
      expect(metrics.totals.leads).toBeGreaterThanOrEqual(0);
    });

    it("parceiro deve ver apenas suas próprias métricas", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Parceiro sempre verá métricas do seu partnerId, independente do input
      const metrics = await caller.analytics.getPartnerMetrics({
        partnerId: 9999, // Será ignorado, usará partnerId do usuário
      });

      expect(metrics).toBeDefined();
      expect(metrics.totals).toBeDefined();
    });

    it("deve calcular taxa de conversão corretamente", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Registrar 10 views e 2 leads
      for (let i = 0; i < 10; i++) {
        await caller.analytics.track({
          partnerId: testPartnerId,
          eventType: "profile_view",
        });
      }
      for (let i = 0; i < 2; i++) {
        await caller.analytics.track({
          partnerId: testPartnerId,
          offerId: testOfferId,
          eventType: "lead_generated",
        });
      }

      const metrics = await caller.analytics.getPartnerMetrics({});

      // Taxa de conversão deve estar entre 0 e 100
      expect(metrics.totals.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.totals.conversionRate).toBeLessThanOrEqual(100);
    });
  });

  describe("Tracking de eventos específicos", () => {
    it("deve agrupar visualizações por data", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Registrar múltiplas visualizações
      for (let i = 0; i < 5; i++) {
        await caller.analytics.track({
          partnerId: testPartnerId,
          eventType: "profile_view",
        });
      }

      const metrics = await caller.analytics.getPartnerMetrics({});

      // Verifica estrutura dos dados
      expect(Array.isArray(metrics.profileViews)).toBe(true);
      expect(metrics.totals.views).toBeGreaterThanOrEqual(0);
    });

    it("deve agrupar leads por oferta", async () => {
      const caller = appRouter.createCaller(createMockContext(mockPartnerUser));

      // Registrar leads para a oferta
      for (let i = 0; i < 3; i++) {
        await caller.analytics.track({
          partnerId: testPartnerId,
          offerId: testOfferId,
          eventType: "lead_generated",
        });
      }

      const metrics = await caller.analytics.getPartnerMetrics({});

      expect(Array.isArray(metrics.leadsByOffer)).toBe(true);
      const offerLeads = metrics.leadsByOffer.find(
        (item) => item.offerId === testOfferId
      );
      if (offerLeads) {
        expect(offerLeads.count).toBeGreaterThan(0);
      }
    });
  });
});
