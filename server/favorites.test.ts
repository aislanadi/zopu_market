import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Favorites System", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 999,
      openId: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      role: "cliente",
      partnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "oauth",
    },
  };

  const caller = appRouter.createCaller(mockContext);

  it("should add a favorite offer", async () => {
    const result = await caller.favorite.add({
      offerId: 1,
      type: "offer",
    });
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should check if offer is favorited", async () => {
    // Primeiro adiciona
    await caller.favorite.add({
      offerId: 1,
      type: "offer",
    });
    
    // Depois verifica
    const result = await caller.favorite.check({
      offerId: 1,
    });
    
    expect(result).toHaveProperty("isFavorite");
    expect(result.isFavorite).toBe(true);
  });

  it("should list user favorites", async () => {
    // Adiciona alguns favoritos
    await caller.favorite.add({
      offerId: 1,
      type: "offer",
    });
    
    await caller.favorite.add({
      partnerId: 2,
      type: "partner",
    });
    
    // Lista favoritos
    const result = await caller.favorite.list();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should remove a favorite", async () => {
    // Adiciona
    await caller.favorite.add({
      offerId: 1,
      type: "offer",
    });
    
    // Remove
    const result = await caller.favorite.remove({
      offerId: 1,
    });
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    
    // Verifica que foi removido
    const check = await caller.favorite.check({
      offerId: 1,
    });
    
    expect(check.isFavorite).toBe(false);
  });

  it("should handle favorite partner", async () => {
    const result = await caller.favorite.add({
      partnerId: 2,
      type: "partner",
    });
    
    expect(result.success).toBe(true);
    
    const check = await caller.favorite.check({
      partnerId: 2,
    });
    
    expect(check.isFavorite).toBe(true);
  });
});
