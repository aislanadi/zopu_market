import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("License Expiry Alert System", () => {
  let buyerCaller: any;
  let testBuyerId: number;

  beforeAll(async () => {
    // Criar buyer de teste
    const buyers = await db.getAllBuyers();
    if (buyers.length > 0) {
      testBuyerId = buyers[0].id;
      buyerCaller = appRouter.createCaller({
        user: { id: 1, role: "user", partnerId: null } as any,
      });
    }
  });

  describe("License Status Calculation", () => {
    it("should return ATIVA for licenses with more than 90 days", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const date120Days = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(date120Days)).toBe("ATIVA");
    });

    it("should return VENCENDO for licenses within 90 days", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const date60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(date60Days)).toBe("VENCENDO");
      
      const date30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(date30Days)).toBe("VENCENDO");
      
      const date1Day = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(date1Day)).toBe("VENCENDO");
    });

    it("should return VENCIDA for expired licenses", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const dateExpired = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(calculateLicenseStatus(dateExpired)).toBe("VENCIDA");
    });

    it("should return NAO_INFORMADA when no date provided", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      expect(calculateLicenseStatus(null)).toBe("NAO_INFORMADA");
      expect(calculateLicenseStatus(undefined)).toBe("NAO_INFORMADA");
    });
  });

  describe("Days Until Expiry Calculation", () => {
    it("should calculate days correctly", async () => {
      const { getDaysUntilExpiry } = await import("./_core/licenseHelper");
      
      const date30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const days = getDaysUntilExpiry(date30Days);
      
      expect(days).toBeGreaterThanOrEqual(29);
      expect(days).toBeLessThanOrEqual(31);
    });

    it("should return negative days for expired licenses", async () => {
      const { getDaysUntilExpiry } = await import("./_core/licenseHelper");
      
      const dateExpired = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const days = getDaysUntilExpiry(dateExpired);
      
      expect(days).toBeLessThan(0);
      expect(days).toBeGreaterThanOrEqual(-11);
      expect(days).toBeLessThanOrEqual(-9);
    });

    it("should return undefined or null when no date provided", async () => {
      const { getDaysUntilExpiry } = await import("./_core/licenseHelper");
      
      const resultNull = getDaysUntilExpiry(null);
      const resultUndefined = getDaysUntilExpiry(undefined);
      
      // Aceita tanto undefined quanto null como valores válidos para "sem data"
      expect(resultNull == null).toBe(true);
      expect(resultUndefined == null).toBe(true);
    });
  });

  describe("Buyer Profile with License Data", () => {
    it("should update buyer with license information", async () => {
      const expiryDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
      
      await db.updateBuyer(testBuyerId, {
        bitrixUrl: "test-alert.bitrix24.com.br",
        bitrixLicenseType: "Enterprise",
        bitrixLicenseExpiry: expiryDate,
      });

      const buyer = await db.getBuyerById(testBuyerId);
      
      expect(buyer?.bitrixUrl).toBe("test-alert.bitrix24.com.br");
      expect(buyer?.bitrixLicenseType).toBe("Enterprise");
      expect(buyer?.bitrixLicenseExpiry).toBeInstanceOf(Date);
    });

    it("should retrieve buyer profile with license fields via tRPC", async () => {
      const profile = await buyerCaller.buyer.getProfile();
      
      expect(profile).toHaveProperty("bitrixUrl");
      expect(profile).toHaveProperty("bitrixLicenseType");
      expect(profile).toHaveProperty("bitrixLicenseExpiry");
    });
  });

  describe("Alert Display Logic", () => {
    it("should not show alert for ATIVA licenses", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const date120Days = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
      const status = calculateLicenseStatus(date120Days);
      
      // Alert should not be displayed
      expect(status).toBe("ATIVA");
    });

    it("should show alert for VENCENDO licenses", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const date60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const status = calculateLicenseStatus(date60Days);
      
      // Alert should be displayed
      expect(status).toBe("VENCENDO");
    });

    it("should show alert for VENCIDA licenses", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const dateExpired = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const status = calculateLicenseStatus(dateExpired);
      
      // Alert should be displayed with high urgency
      expect(status).toBe("VENCIDA");
    });

    it("should not show alert when no license date informed", async () => {
      const { calculateLicenseStatus } = await import("./_core/licenseHelper");
      
      const status = calculateLicenseStatus(null);
      
      // Alert should not be displayed
      expect(status).toBe("NAO_INFORMADA");
    });
  });

  describe("Notification Triggers", () => {
    it("should trigger notification at 90 days", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      const date90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date90)).toBe(90);
    });

    it("should trigger notification at 60 days", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      const date60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date60)).toBe(60);
    });

    it("should trigger notification at 30 days", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      const date30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date30)).toBe(30);
    });

    it("should trigger notification on expiry (0 days)", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      const dateExpired = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(dateExpired)).toBe(0);
    });

    it("should not trigger notification for active licenses", async () => {
      const { getNotificationTrigger } = await import("./_core/licenseHelper");
      
      const date120 = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
      expect(getNotificationTrigger(date120)).toBeNull();
    });
  });
});
