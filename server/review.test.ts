import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Review System", () => {
  let testPartnerId: number;

  beforeAll(async () => {
    // Usar um parceiro existente no banco
    testPartnerId = 2;
  });

  describe("review.listByPartner", () => {
    it("should list reviews for a specific partner", async () => {
      const caller = appRouter.createCaller({ user: null });
      const reviews = await caller.review.listByPartner({ partnerId: testPartnerId });
      
      expect(Array.isArray(reviews)).toBe(true);
      
      if (reviews.length > 0) {
        const review = reviews[0];
        expect(review).toHaveProperty("id");
        expect(review).toHaveProperty("partnerId");
        expect(review).toHaveProperty("reviewerName");
        expect(review).toHaveProperty("rating");
        expect(review.partnerId).toBe(testPartnerId);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      }
    });

    it("should return empty array for partner with no reviews", async () => {
      const caller = appRouter.createCaller({ user: null });
      const reviews = await caller.review.listByPartner({ partnerId: 99999 });
      
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBe(0);
    });
  });

  describe("review.listAll", () => {
    it("should list all reviews", async () => {
      const caller = appRouter.createCaller({ user: null });
      const reviews = await caller.review.listAll();
      
      expect(Array.isArray(reviews)).toBe(true);
      
      if (reviews.length > 0) {
        const review = reviews[0];
        expect(review).toHaveProperty("id");
        expect(review).toHaveProperty("partnerId");
        expect(review).toHaveProperty("rating");
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("review.create", () => {
    it("should create a review when user is authenticated", async () => {
      const mockUser = {
        openId: "test-user-123",
        name: "Test User",
        role: "user" as const,
      };
      
      const caller = appRouter.createCaller({ user: mockUser });
      
      const result = await caller.review.create({
        partnerId: testPartnerId,
        rating: 5,
        comment: "Excellent service! Very professional team.",
      });
      
      expect(result).toBeDefined();
    });

    it("should fail when user is not authenticated", async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.review.create({
          partnerId: testPartnerId,
          rating: 5,
          comment: "Test review",
        })
      ).rejects.toThrow();
    });

    it("should fail with invalid rating", async () => {
      const mockUser = {
        openId: "test-user-123",
        name: "Test User",
        role: "user" as const,
      };
      
      const caller = appRouter.createCaller({ user: mockUser });
      
      await expect(
        caller.review.create({
          partnerId: testPartnerId,
          rating: 6, // Invalid: must be 1-5
          comment: "Test review",
        })
      ).rejects.toThrow();
    });
  });

  describe("partner.getPublicProfile", () => {
    it("should return partner profile with offers and reviews", async () => {
      const caller = appRouter.createCaller({ user: null });
      const profile = await caller.partner.getPublicProfile({ id: testPartnerId });
      
      expect(profile).toBeDefined();
      expect(profile.partner).toBeDefined();
      expect(profile.partner.id).toBe(testPartnerId);
      expect(Array.isArray(profile.offers)).toBe(true);
      expect(Array.isArray(profile.reviews)).toBe(true);
      expect(typeof profile.stats.avgRating).toBe("number");
      expect(typeof profile.stats.totalReviews).toBe("number");
      expect(typeof profile.stats.totalOffers).toBe("number");
    });

    it("should calculate correct average rating", async () => {
      const caller = appRouter.createCaller({ user: null });
      const profile = await caller.partner.getPublicProfile({ id: testPartnerId });
      
      if (profile.reviews.length > 0) {
        const sum = profile.reviews.reduce((acc, r) => acc + r.rating, 0);
        const expectedAvg = sum / profile.reviews.length;
        
        expect(profile.stats.avgRating).toBeCloseTo(expectedAvg, 1);
        expect(profile.stats.totalReviews).toBe(profile.reviews.length);
      }
    });
  });
});
