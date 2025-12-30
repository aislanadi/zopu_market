import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("License Management System", () => {
  let adminCaller: any;
  let testBuyerId: number;

  beforeAll(async () => {
    // Admin caller
    adminCaller = appRouter.createCaller({
      user: { id: 1, role: "admin", partnerId: null } as any,
    });

    // Criar buyer de teste com licença
    const buyers = await db.getAllBuyers();
    if (buyers.length > 0) {
      testBuyerId = buyers[0].id;
      
      // Atualizar com dados de licença
      await db.updateBuyer(testBuyerId, {
        bitrixUrl: "test-company.bitrix24.com.br",
        bitrixLicenseType: "Professional",
        bitrixLicenseExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      });
    }
  });

  describe("License Fields", () => {
    it("should store Bitrix24 license information", async () => {
      const buyer = await db.getBuyerById(testBuyerId);
      
      expect(buyer).toBeDefined();
      expect(buyer?.bitrixUrl).toBe("test-company.bitrix24.com.br");
      expect(buyer?.bitrixLicenseType).toBe("Professional");
      expect(buyer?.bitrixLicenseExpiry).toBeInstanceOf(Date);
    });
  });

  describe("License Status Calculation", () => {
    it("should calculate license status correctly", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      // Licença ativa (mais de 90 dias)
      const activeDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(activeDate)).toBe("ATIVA");
      
      // Licença vencendo (30 dias)
      const expiringDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(expiringDate)).toBe("VENCENDO");
      
      // Licença vencida
      const expiredDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(expiredDate)).toBe("VENCIDA");
      
      // Sem data informada
      expect(calculateLicenseStatus(null)).toBe("NAO_INFORMADA");
    });

    it("should calculate days until expiry", async () => {
      const { getDaysUntilExpiry } = await import("./_core/licenseHelper");
      
      const date30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const days = getDaysUntilExpiry(date30Days);
      
      expect(days).toBeGreaterThanOrEqual(29);
      expect(days).toBeLessThanOrEqual(31);
    });
  });

  describe("Admin License Dashboard", () => {
    it("should list licenses expiring in 90 days", async () => {
      const licenses = await adminCaller.license.getExpiring({ days: 90 });
      
      expect(Array.isArray(licenses)).toBe(true);
      
      if (licenses.length > 0) {
        const license = licenses[0];
        expect(license).toHaveProperty("daysUntilExpiry");
        expect(license).toHaveProperty("licenseStatus");
      }
    });

    it("should filter licenses by period", async () => {
      const licenses30 = await adminCaller.license.getExpiring({ days: 30 });
      const licenses90 = await adminCaller.license.getExpiring({ days: 90 });
      
      expect(Array.isArray(licenses30)).toBe(true);
      expect(Array.isArray(licenses90)).toBe(true);
      
      // 90 dias deve incluir tudo que 30 dias inclui
      expect(licenses90.length).toBeGreaterThanOrEqual(licenses30.length);
    });
  });

  describe("License Expiration Notifications", () => {
    it("should check license expirations without errors", async () => {
      const result = await adminCaller.license.checkExpirations();
      
      expect(result).toHaveProperty("checked");
      expect(result).toHaveProperty("notified");
      expect(result).toHaveProperty("details");
      expect(typeof result.checked).toBe("number");
      expect(typeof result.notified).toBe("number");
      expect(Array.isArray(result.details)).toBe(true);
    });

    it("should determine notification trigger correctly", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      // 90 dias
      const date90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date90)).toBe(90);
      
      // 60 dias
      const date60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date60)).toBe(60);
      
      // 30 dias
      const date30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date30)).toBe(30);
      
      // Vencida
      const dateExpired = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(dateExpired)).toBe(0);
      
      // Sem notificação (mais de 90 dias)
      const date120 = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date120)).toBeNull();
    });
  });

  describe("Buyer Profile with License", () => {
    it("should include license fields in buyer profile", async () => {
      const buyer = await db.getBuyerById(testBuyerId);
      
      expect(buyer).toHaveProperty("bitrixUrl");
      expect(buyer).toHaveProperty("bitrixLicenseType");
      expect(buyer).toHaveProperty("bitrixLicenseExpiry");
    });
  });
});
