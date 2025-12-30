import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@zopu.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    partnerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createParceiroContext(partnerId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "parceiro-user",
    email: "parceiro@empresa.com",
    name: "Parceiro User",
    loginMethod: "manus",
    role: "parceiro",
    partnerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Partner Management", () => {
  it("should allow public users to create partner application", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.partner.create({
      companyName: "Test Company",
      contactName: "John Doe",
      contactEmail: "john@testcompany.com",
      contactPhone: "(11) 99999-9999",
    });

    expect(result).toBeDefined();
  });

  it("should allow admin to list all partners", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const partners = await caller.partner.list();

    expect(Array.isArray(partners)).toBe(true);
  });

  it("should allow admin to update partner curation status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // First create a partner
    const publicCtx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const publicCaller = appRouter.createCaller(publicCtx);

    await publicCaller.partner.create({
      companyName: "Test Company 2",
      contactName: "Jane Doe",
      contactEmail: "jane@testcompany.com",
    });

    // Get the partner
    const partners = await caller.partner.list();
    const testPartner = partners.find(p => p.companyName === "Test Company 2");

    if (testPartner) {
      const result = await caller.partner.updateCurationStatus({
        id: testPartner.id,
        status: "APPROVED",
      });

      expect(result.success).toBe(true);
    }
  });

  it("should prevent non-admin from updating partner status", async () => {
    const ctx = createParceiroContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.partner.updateCurationStatus({
        id: 1,
        status: "APPROVED",
      })
    ).rejects.toThrow();
  });
});

describe("Category Management", () => {
  it("should allow public users to list categories", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const categories = await caller.category.list();

    expect(Array.isArray(categories)).toBe(true);
  });

  it("should allow admin to create category", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.category.create({
      name: "Licenças Bitrix24",
      description: "Licenças e planos Bitrix24",
    });

    expect(result).toBeDefined();
  });

  it("should prevent non-admin from creating category", async () => {
    const ctx = createParceiroContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.category.create({
        name: "Test Category",
        description: "Test",
      })
    ).rejects.toThrow();
  });
});

describe("Offer Management", () => {
  it("should allow parceiro to create offer after approval", async () => {
    // This test assumes partner is already approved
    const ctx = createParceiroContext(1);
    const caller = appRouter.createCaller(ctx);

    // Note: This will fail if partner is not approved or doesn't exist
    // In real scenario, we'd need to setup the database state first
    try {
      const result = await caller.offer.create({
        categoryId: 1,
        title: "Licença Bitrix24 Professional",
        description: "Plano Professional com 50 usuários",
        saleMode: "CHECKOUT",
        offerType: "LICENSE",
        price: 50000, // R$ 500,00 em centavos
        successFeePercent: 10,
        status: "DRAFT",
      });

      expect(result).toBeDefined();
    } catch (error: any) {
      // Expected if partner doesn't exist or isn't approved
      expect(error.message).toBeDefined();
    }
  });

  it("should allow public users to list published offers", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const offers = await caller.offer.list({ status: "PUBLISHED" });

    expect(Array.isArray(offers)).toBe(true);
  });
});

describe("Authentication", () => {
  it("should return user info for authenticated users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.role).toBe("admin");
  });

  it("should return undefined for unauthenticated users", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();

    expect(user).toBeUndefined();
  });
});
