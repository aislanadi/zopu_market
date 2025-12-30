import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

const mockAdminUser: User = {
  id: 999,
  openId: "test-admin-bitrix",
  name: "Admin Test",
  email: "admin@test.com",
  loginMethod: "oauth",
  role: "admin",
  partnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("Bitrix24 Plans with Billing Periods and Variants", () => {
  const adminCaller = appRouter.createCaller({ user: mockAdminUser });

  it("deve existir 4 planos Bitrix24: Basic, Standard, Professional, Enterprise", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const bitrix24Offers = offers.filter(o => 
      o.partnerId === 1 && 
      o.categoryId === 1 &&
      o.offerType === "LICENSE"
    );
    
    expect(bitrix24Offers.length).toBeGreaterThanOrEqual(4);
    
    const titles = bitrix24Offers.map(o => o.title);
    expect(titles).toContain("Bitrix24 Basic");
    expect(titles).toContain("Bitrix24 Standard");
    expect(titles).toContain("Bitrix24 Professional");
    expect(titles).toContain("Bitrix24 Enterprise");
  });

  it("plano Basic deve ter periodicidade trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const basic = offers.find(o => o.title === "Bitrix24 Basic");
    
    expect(basic).toBeDefined();
    expect(basic?.billingPeriods).toBeTruthy();
    
    const periods = JSON.parse(basic!.billingPeriods!);
    expect(periods).toContain("QUARTERLY");
    expect(periods).toContain("ANNUAL");
    expect(periods).not.toContain("MONTHLY");
  });

  it("plano Standard deve ter periodicidade trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const standard = offers.find(o => o.title === "Bitrix24 Standard");
    
    expect(standard).toBeDefined();
    expect(standard?.billingPeriods).toBeTruthy();
    
    const periods = JSON.parse(standard!.billingPeriods!);
    expect(periods).toContain("QUARTERLY");
    expect(periods).toContain("ANNUAL");
    expect(periods).not.toContain("MONTHLY");
  });

  it("plano Professional deve ter periodicidade trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const professional = offers.find(o => o.title === "Bitrix24 Professional");
    
    expect(professional).toBeDefined();
    expect(professional?.billingPeriods).toBeTruthy();
    
    const periods = JSON.parse(professional!.billingPeriods!);
    expect(periods).toContain("QUARTERLY");
    expect(periods).toContain("ANNUAL");
    expect(periods).not.toContain("MONTHLY");
  });

  it("plano Enterprise deve ter periodicidade mensal, trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const enterprise = offers.find(o => o.title === "Bitrix24 Enterprise");
    
    expect(enterprise).toBeDefined();
    expect(enterprise?.billingPeriods).toBeTruthy();
    
    const periods = JSON.parse(enterprise!.billingPeriods!);
    expect(periods).toContain("MONTHLY");
    expect(periods).toContain("QUARTERLY");
    expect(periods).toContain("ANNUAL");
  });

  it("plano Enterprise deve ter 4 variantes (250, 500, 1000, 2000 usuários)", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const enterprise = offers.find(o => o.title === "Bitrix24 Enterprise");
    
    expect(enterprise).toBeDefined();
    expect(enterprise?.variants).toBeTruthy();
    
    const variants = JSON.parse(enterprise!.variants!);
    expect(variants).toHaveLength(4);
    
    const userLimits = variants.map((v: any) => v.userLimit);
    expect(userLimits).toContain(250);
    expect(userLimits).toContain(500);
    expect(userLimits).toContain(1000);
    expect(userLimits).toContain(2000);
  });

  it("variantes Enterprise devem ter preços para mensal, trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const enterprise = offers.find(o => o.title === "Bitrix24 Enterprise");
    
    expect(enterprise).toBeDefined();
    const variants = JSON.parse(enterprise!.variants!);
    
    variants.forEach((variant: any) => {
      expect(variant.priceMonthly).toBeGreaterThan(0);
      expect(variant.priceQuarterly).toBeGreaterThan(0);
      expect(variant.priceAnnual).toBeGreaterThan(0);
      
      // Validar que trimestral tem desconto (menor que 3x mensal)
      expect(variant.priceQuarterly).toBeLessThan(variant.priceMonthly * 3);
      
      // Validar que anual tem desconto (menor que 12x mensal)
      expect(variant.priceAnnual).toBeLessThan(variant.priceMonthly * 12);
    });
  });

  it("planos Basic, Standard e Professional devem ter preços trimestral e anual", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const plans = ["Bitrix24 Basic", "Bitrix24 Standard", "Bitrix24 Professional"];
    
    for (const planName of plans) {
      const plan = offers.find(o => o.title === planName);
      expect(plan).toBeDefined();
      expect(plan?.priceQuarterly).toBeGreaterThan(0);
      expect(plan?.priceAnnual).toBeGreaterThan(0);
      expect(plan?.priceMonthly).toBeNull();
    }
  });

  it("plano Enterprise deve ter saleMode LEAD_FORM (sob consulta)", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const enterprise = offers.find(o => o.title === "Bitrix24 Enterprise");
    
    expect(enterprise).toBeDefined();
    expect(enterprise?.saleMode).toBe("LEAD_FORM");
  });

  it("planos Basic, Standard e Professional devem ter saleMode CHECKOUT", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const plans = ["Bitrix24 Basic", "Bitrix24 Standard", "Bitrix24 Professional"];
    
    for (const planName of plans) {
      const plan = offers.find(o => o.title === planName);
      expect(plan).toBeDefined();
      expect(plan?.saleMode).toBe("CHECKOUT");
    }
  });

  it("não deve existir mais o plano Start+", async () => {
    const offers = await adminCaller.offer.list({ status: "PUBLISHED" });
    const startPlus = offers.find(o => o.title === "Bitrix24 Start+");
    
    expect(startPlus).toBeUndefined();
  });
});
