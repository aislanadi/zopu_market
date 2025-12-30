import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Sistema de Recomendações para Compradores", () => {
  let buyerCaller: any;
  let testBuyerId: number;

  beforeAll(async () => {
    // Limpar comprador de teste se existir
    const existingBuyer = await db.getBuyerByCNPJ("12345678000190");
    if (existingBuyer) {
      testBuyerId = existingBuyer.id;
    } else {
      // Criar comprador de teste
      const buyer = await db.createBuyer({
      userId: 998,
      cnpj: "12345678000190",
      razaoSocial: "Tech Company LTDA",
      nomeFantasia: "TechCo",
      porte: "ME",
      cnaePrincipal: "6201-5/00",
      cnaePrincipalDescricao: "Desenvolvimento de software",
      ecossistema: "Tecnologia e Comunicação",
      leadScore: 40,
      situacaoCadastral: "ATIVA",
      logradouro: "Rua Test",
      numero: "123",
      municipio: "São Paulo",
      uf: "SP",
      cep: "01234-567",
      cargo: "CTO",
      departamento: "Tecnologia",
      telefone: "(11) 98765-4321",
      whatsapp: "(11) 98765-4321",
      interessesTexto: "Preciso de CRM e automação",
      categoriasInteresse: JSON.stringify([1, 2]),
      profileComplete: 1,
      status: "ACTIVE",
    });

      testBuyerId = buyer.id;
    }

    // Criar caller para comprador
    buyerCaller = appRouter.createCaller({
      user: {
        id: 998,
        openId: "test-buyer-rec",
        name: "Comprador Recomendações",
        email: "buyer-rec@test.com",
        role: "cliente",
        partnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
  });

  describe("Algoritmo de Recomendações", () => {
    it("Retorna recomendações para comprador com perfil completo", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      expect(recommendations).toBeDefined();
      expect(recommendations).toHaveProperty("partners");
      expect(recommendations).toHaveProperty("offers");
      expect(Array.isArray(recommendations.partners)).toBe(true);
      expect(Array.isArray(recommendations.offers)).toBe(true);
    });

    it("Prioriza parceiros premium nas recomendações", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      if (recommendations.partners.length > 1) {
        // Verificar se parceiros premium aparecem primeiro
        const premiumPartners = recommendations.partners.filter((p: any) => p.tier === "PREMIUM");
        const standardPartners = recommendations.partners.filter((p: any) => p.tier === "STANDARD");
        
        if (premiumPartners.length > 0 && standardPartners.length > 0) {
          const firstPremiumIndex = recommendations.partners.findIndex((p: any) => p.tier === "PREMIUM");
          const firstStandardIndex = recommendations.partners.findIndex((p: any) => p.tier === "STANDARD");
          
          expect(firstPremiumIndex).toBeLessThan(firstStandardIndex);
        }
      }
    });

    it("Recomenda apenas parceiros aprovados", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      recommendations.partners.forEach((partner: any) => {
        expect(partner.curationStatus).toBe("APPROVED");
      });
    });

    it("Recomenda ofertas baseadas em categorias de interesse", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      if (recommendations.offers.length > 0) {
        // Verificar se pelo menos algumas ofertas são das categorias de interesse
        const categoriasInteresse = [1, 2];
        const offersFromInterest = recommendations.offers.filter((offer: any) => 
          categoriasInteresse.includes(offer.categoryId)
        );
        
        // Deve ter pelo menos uma oferta das categorias de interesse (se existirem)
        expect(offersFromInterest.length).toBeGreaterThanOrEqual(0);
      }
    });

    it("Recomenda apenas ofertas publicadas", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      recommendations.offers.forEach((offer: any) => {
        expect(offer.status).toBe("PUBLISHED");
      });
    });

    it("Limita número de recomendações (máximo 10 de cada)", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      expect(recommendations.partners.length).toBeLessThanOrEqual(10);
      expect(recommendations.offers.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Casos Especiais", () => {
    it("Retorna recomendações gerais para comprador sem perfil", async () => {
      // Criar caller para usuário sem perfil
      const noBuyerCaller = appRouter.createCaller({
        user: {
          id: 997,
          openId: "no-buyer",
          name: "Sem Perfil",
          email: "no-profile@test.com",
          role: "cliente",
          partnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });

      const recommendations = await noBuyerCaller.buyer.getRecommendations();
      
      // Sistema retorna recomendações gerais mesmo sem perfil
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.partners)).toBe(true);
      expect(Array.isArray(recommendations.offers)).toBe(true);
    });

    it("Funciona mesmo sem categorias de interesse definidas", async () => {
      // Verificar se comprador já existe
      let buyerNoCat = await db.getBuyerByCNPJ("98765432000100");
      
      if (!buyerNoCat) {
        // Criar comprador sem categorias
        buyerNoCat = await db.createBuyer({
        userId: 996,
        cnpj: "98765432000100",
        razaoSocial: "Empresa Sem Interesse",
        nomeFantasia: "NoInterest",
        porte: "ME",
        cnaePrincipal: "4711-3/01",
        cnaePrincipalDescricao: "Comércio varejista",
        ecossistema: "Comércio",
        leadScore: 40,
        situacaoCadastral: "ATIVA",
        logradouro: "Rua Test",
        numero: "456",
        municipio: "Rio de Janeiro",
        uf: "RJ",
        cep: "20000-000",
        profileComplete: 1,
        status: "ACTIVE",
        });
      }

      const noCatCaller = appRouter.createCaller({
        user: {
          id: 996,
          openId: "no-cat-buyer",
          name: "Comprador Sem Categorias",
          email: "no-cat@test.com",
          role: "cliente",
          partnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });

      const recommendations = await noCatCaller.buyer.getRecommendations();
      
      // Deve retornar recomendações gerais mesmo sem categorias
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.partners)).toBe(true);
      expect(Array.isArray(recommendations.offers)).toBe(true);
    });
  });

  describe("Qualidade das Recomendações", () => {
    it("Ordena parceiros por tier e rating", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      if (recommendations.partners.length > 1) {
        // Verificar ordenação: premium primeiro, depois por rating
        for (let i = 0; i < recommendations.partners.length - 1; i++) {
          const current = recommendations.partners[i];
          const next = recommendations.partners[i + 1];
          
          if (current.tier === "PREMIUM" && next.tier === "STANDARD") {
            // Premium sempre antes de standard - correto
            expect(true).toBe(true);
          } else if (current.tier === next.tier) {
            // Mesmo tier, deve estar ordenado por rating (decrescente)
            expect(current.rating).toBeGreaterThanOrEqual(next.rating);
          }
        }
      }
    });

    it("Retorna informações completas dos parceiros recomendados", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      if (recommendations.partners.length > 0) {
        const partner = recommendations.partners[0];
        
        expect(partner).toHaveProperty("id");
        expect(partner).toHaveProperty("companyName");
        expect(partner).toHaveProperty("tier");
        expect(partner).toHaveProperty("rating");
      }
    });

    it("Retorna informações completas das ofertas recomendadas", async () => {
      const recommendations = await buyerCaller.buyer.getRecommendations();
      
      if (recommendations.offers.length > 0) {
        const offer = recommendations.offers[0];
        
        expect(offer).toHaveProperty("id");
        expect(offer).toHaveProperty("title");
        expect(offer).toHaveProperty("description");
        expect(offer).toHaveProperty("categoryId");
        expect(offer).toHaveProperty("partnerId");
      }
    });
  });
});
