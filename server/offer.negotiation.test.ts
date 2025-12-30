import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Workflow de Negociação de Success Fee", () => {
  let adminCaller: any;
  let parceiroCaller: any;
  let testCategoryId: number;

  beforeAll(async () => {
    // Criar callers para admin e parceiro
    adminCaller = appRouter.createCaller({
      user: {
        id: 999,
        openId: "test-admin",
        name: "Admin Test",
        email: "admin@test.com",
        role: "admin",
        partnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });

    parceiroCaller = appRouter.createCaller({
      user: {
        id: 998,
        openId: "test-parceiro",
        name: "Parceiro Test",
        email: "parceiro@test.com",
        role: "parceiro",
        partnerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });

    // Criar categoria de teste
    const categories = await db.getAllCategories();
    testCategoryId = categories[0]?.id || 1;
  });

  it("Parceiro cria oferta e vai automaticamente para PENDING_INTERVIEW", async () => {
    const offer = await parceiroCaller.offer.create({
      title: "Oferta Teste Workflow",
      description: "Descrição teste",
      categoryId: testCategoryId,
      offerType: "SERVICE_STANDARD",
      saleMode: "LEAD_FORM",
      price: 50000,
      profitMargin: 30,
      successFeePercent: 15,
      status: "DRAFT", // Parceiro tenta criar como DRAFT
    });

    expect(offer).toBeDefined();

    // Buscar a oferta criada para verificar status
    const offers = await db.getAllOffers({ partnerId: 1 });
    const createdOffer = offers.find((o: any) => o.title === "Oferta Teste Workflow");
    
    // Deve estar PENDING_INTERVIEW independente do que o parceiro passou
    expect(createdOffer?.status).toBe("PENDING_INTERVIEW");
    expect(createdOffer?.profitMargin).toBe(30);
  });

  it("Admin consegue listar ofertas pendentes", async () => {
    const pendingOffers = await adminCaller.offer.getPending();
    
    expect(Array.isArray(pendingOffers)).toBe(true);
    expect(pendingOffers.length).toBeGreaterThan(0);
    
    // Todas devem ter status PENDING_INTERVIEW
    pendingOffers.forEach((offer: any) => {
      expect(offer.status).toBe("PENDING_INTERVIEW");
    });
  });

  it("Admin aprova oferta definindo success fee negociado", async () => {
    // Buscar uma oferta pendente
    const pendingOffers = await adminCaller.offer.getPending();
    const offerToApprove = pendingOffers[0];
    
    expect(offerToApprove).toBeDefined();

    // Aprovar com novo success fee
    const result = await adminCaller.offer.approve({
      id: offerToApprove.id,
      successFeePercent: 12,
      negotiationNotes: "Negociado após entrevista: margem líquida de 30%, acordado 12% de success fee",
    });

    expect(result.success).toBe(true);

    // Verificar que oferta foi publicada
    const approvedOffer = await db.getOfferById(offerToApprove.id);
    expect(approvedOffer?.status).toBe("PUBLISHED");
    expect(approvedOffer?.successFeePercent).toBe(12);
    expect(approvedOffer?.negotiationNotes).toContain("Negociado após entrevista");
  });

  it("Admin rejeita oferta com motivo", async () => {
    // Criar outra oferta pendente
    await parceiroCaller.offer.create({
      title: "Oferta para Rejeitar",
      description: "Teste rejeição",
      categoryId: testCategoryId,
      offerType: "SERVICE_STANDARD",
      saleMode: "LEAD_FORM",
      price: 30000,
      profitMargin: 10,
      successFeePercent: 20,
    });

    // Buscar a oferta criada
    const offers = await db.getAllOffers({ partnerId: 1 });
    const offerToReject = offers.find((o: any) => o.title === "Oferta para Rejeitar");
    
    expect(offerToReject).toBeDefined();
    expect(offerToReject?.status).toBe("PENDING_INTERVIEW");

    // Rejeitar
    const result = await adminCaller.offer.reject({
      id: offerToReject!.id,
      negotiationNotes: "Margem líquida muito baixa para viabilizar parceria",
    });

    expect(result.success).toBe(true);

    // Verificar que oferta voltou para DRAFT
    const rejectedOffer = await db.getOfferById(offerToReject!.id);
    expect(rejectedOffer?.status).toBe("DRAFT");
    expect(rejectedOffer?.negotiationNotes).toContain("Margem líquida muito baixa");
  });

  it("Não permite aprovar oferta que não está PENDING_INTERVIEW", async () => {
    // Criar oferta como admin (vai direto para DRAFT)
    const offer = await adminCaller.offer.create({
      title: "Oferta Admin Direta",
      description: "Criada por admin",
      categoryId: testCategoryId,
      offerType: "DIGITAL",
      saleMode: "CHECKOUT",
      price: 10000,
      successFeePercent: 10,
      status: "DRAFT",
    });

    // Buscar a oferta
    const offers = await db.getAllOffers();
    const draftOffer = offers.find((o: any) => o.title === "Oferta Admin Direta");
    
    expect(draftOffer?.status).toBe("DRAFT");

    // Tentar aprovar deve falhar
    await expect(
      adminCaller.offer.approve({
        id: draftOffer!.id,
        successFeePercent: 15,
      })
    ).rejects.toThrow("Apenas ofertas pendentes podem ser aprovadas");
  });
});
