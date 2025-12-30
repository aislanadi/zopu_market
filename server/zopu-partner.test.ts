import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

const mockAdminUser: User = {
  id: 999,
  openId: "test-admin-zopu",
  name: "Admin Test",
  email: "admin@test.com",
  loginMethod: "oauth",
  role: "admin",
  partnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const mockBuyerUser: User = {
  id: 998,
  openId: "test-buyer-zopu",
  name: "Buyer Test",
  email: "buyer@test.com",
  loginMethod: "oauth",
  role: "user",
  partnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("ZOPU Partner Integration", () => {
  const adminCaller = appRouter.createCaller({ user: mockAdminUser });
  const buyerCaller = appRouter.createCaller({ user: mockBuyerUser });

  it("deve existir parceiro ZOPU com ID 1 e tier PREMIUM", async () => {
    const partner = await db.getPartnerById(1);
    
    expect(partner).toBeDefined();
    expect(partner?.id).toBe(1);
    expect(partner?.companyName).toBe("ZOPU Tecnologia");
    expect(partner?.tier).toBe("PREMIUM");
    expect(partner?.curationStatus).toBe("APPROVED");
  });

  it("deve existir categoria 'Licenças Bitrix24'", async () => {
    const categories = await adminCaller.category.list();
    const licenseCategory = categories.find(c => c.name === "Licenças Bitrix24");
    
    expect(licenseCategory).toBeDefined();
    expect(licenseCategory?.id).toBe(1);
  });

  it("deve existir pelo menos 3 ofertas de licenças Bitrix24 da ZOPU", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const zopuOffers = offers.filter(o => o.partnerId === 1 && o.offerType === "LICENSE");
    
    expect(zopuOffers.length).toBeGreaterThanOrEqual(3);
    
    // Verificar se as ofertas principais existem
    const titles = zopuOffers.map(o => o.title);
    expect(titles).toContain("Bitrix24 Start+");
    expect(titles).toContain("Bitrix24 Professional");
    expect(titles).toContain("Bitrix24 Enterprise");
  });

  it("deve filtrar ofertas por parceiro ZOPU (ID 1)", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const zopuOffers = allOffers.filter(o => o.partnerId === 1);
    
    expect(zopuOffers.length).toBeGreaterThan(0);
    zopuOffers.forEach(offer => {
      expect(offer.partnerId).toBe(1);
    });
  });

  it("deve filtrar ofertas por categoria 'Licenças Bitrix24' (ID 1)", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const licenseOffers = allOffers.filter(o => o.categoryId === 1);
    
    expect(licenseOffers.length).toBeGreaterThan(0);
    licenseOffers.forEach(offer => {
      expect(offer.categoryId).toBe(1);
    });
  });

  it("deve filtrar ofertas por parceiro ZOPU E categoria Licenças (combinado)", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const filteredOffers = allOffers.filter(o => o.partnerId === 1 && o.categoryId === 1);
    
    expect(filteredOffers.length).toBeGreaterThanOrEqual(3);
    filteredOffers.forEach(offer => {
      expect(offer.partnerId).toBe(1);
      expect(offer.categoryId).toBe(1);
      expect(offer.offerType).toBe("LICENSE");
    });
  });

  it("ofertas de licenças devem ter campos obrigatórios preenchidos", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const zopuLicenses = allOffers.filter(o => 
      o.partnerId === 1 && 
      o.categoryId === 1 &&
      ["Bitrix24 Start+", "Bitrix24 Professional", "Bitrix24 Enterprise"].includes(o.title)
    );
    
    expect(zopuLicenses.length).toBe(3);
    
    zopuLicenses.forEach(offer => {
      expect(offer.title).toBeTruthy();
      expect(offer.description).toBeTruthy();
      expect(offer.icp).toBeTruthy();
      expect(offer.promessa).toBeTruthy();
      expect(offer.entregaveis).toBeTruthy();
      expect(offer.cases).toBeTruthy();
      expect(offer.faq).toBeTruthy();
      expect(offer.status).toBe("PUBLISHED");
      expect(offer.offerType).toBe("LICENSE");
    });
  });

  it("Bitrix24 Start+ e Professional devem ter modo CHECKOUT com preço", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const checkoutOffers = allOffers.filter(o => 
      o.partnerId === 1 && 
      ["Bitrix24 Start+", "Bitrix24 Professional"].includes(o.title)
    );
    
    expect(checkoutOffers.length).toBe(2);
    
    checkoutOffers.forEach(offer => {
      expect(offer.saleMode).toBe("CHECKOUT");
      expect(offer.price).toBeGreaterThan(0);
    });
  });

  it("Bitrix24 Enterprise deve ter modo LEAD_FORM sem preço fixo", async () => {
    const allOffers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const enterpriseOffer = allOffers.find(o => 
      o.partnerId === 1 && 
      o.title === "Bitrix24 Enterprise"
    );
    
    expect(enterpriseOffer).toBeDefined();
    expect(enterpriseOffer?.saleMode).toBe("LEAD_FORM");
    expect(enterpriseOffer?.price).toBeNull();
  });
});
