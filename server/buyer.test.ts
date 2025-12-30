import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { searchCNPJ, classifyEcosystem, calculateLeadScore } from "./_core/receitaws";

describe("Sistema de Cadastro de Comprador", () => {
  let buyerCaller: any;
  let adminCaller: any;

  beforeAll(async () => {
    // Criar caller para comprador
    buyerCaller = appRouter.createCaller({
      user: {
        id: 997,
        openId: "test-buyer",
        name: "Comprador Test",
        email: "comprador@test.com",
        role: "cliente",
        partnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });

    // Criar caller para admin
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
  });

  describe("Integração ReceitaWS", () => {
    it("Classifica empresa em ecossistema baseado no CNAE", () => {
      // CNAE 6201-5/00 = Desenvolvimento de software
      const ecossistema1 = classifyEcosystem("6201-5/00");
      expect(ecossistema1).toBe("Tecnologia e Comunicação");

      // CNAE 4711-3/01 = Comércio varejista
      const ecossistema2 = classifyEcosystem("4711-3/01");
      expect(ecossistema2).toBe("Comércio");

      // CNAE 8511-2/00 = Educação infantil
      const ecossistema3 = classifyEcosystem("8511-2/00");
      expect(ecossistema3).toBe("Educação");

      // CNAE 8610-1/01 = Atividades de atendimento hospitalar
      const ecossistema4 = classifyEcosystem("8610-1/01");
      expect(ecossistema4).toBe("Saúde");
    });

    it("Calcula lead score baseado no porte da empresa", () => {
      expect(calculateLeadScore("MEI")).toBe(20);
      expect(calculateLeadScore("ME")).toBe(40);
      expect(calculateLeadScore("EPP")).toBe(60);
      expect(calculateLeadScore("DEMAIS")).toBe(80);
      expect(calculateLeadScore("DESCONHECIDO")).toBe(50);
    });

    it.skip("Busca dados reais de CNPJ na ReceitaWS (teste de integração)", async () => {
      // CNPJ da Google Brasil (exemplo público)
      const data = await searchCNPJ("06990590000123");
      
      expect(data).toBeDefined();
      expect(data?.nome).toBeDefined();
      expect(data?.atividade_principal).toBeDefined();
    }, 10000); // Timeout maior para API externa
  });

  describe("Procedures de Buyer", () => {
    it("Comprador completa perfil com dados da empresa", async () => {
      const result = await buyerCaller.buyer.completeProfile({
        cnpj: "12345678000190",
        razaoSocial: "Empresa Test LTDA",
        nomeFantasia: "Test Corp",
        porte: "ME",
        cnaePrincipal: "6201-5/00",
        cnaePrincipalDescricao: "Desenvolvimento de programas de computador sob encomenda",
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
        interessesTexto: "Preciso de CRM e automação de marketing",
        categoriasInteresse: JSON.stringify([1, 2]),
      });

      expect(result.success).toBe(true);

      // Verificar se perfil foi criado
      const profile = await buyerCaller.buyer.getProfile();
      expect(profile).toBeDefined();
      expect(profile?.cnpj).toBe("12345678000190");
      expect(profile?.razaoSocial).toBe("Empresa Test LTDA");
      expect(profile?.ecossistema).toBe("Tecnologia e Comunicação");
      expect(profile?.leadScore).toBe(40); // ME = 40
      expect(profile?.profileComplete).toBe(1);
    });

    it("Comprador atualiza perfil existente", async () => {
      const result = await buyerCaller.buyer.updateProfile({
        cargo: "CEO",
        departamento: "Diretoria",
        interessesTexto: "Agora também preciso de ERP",
      });

      expect(result.success).toBe(true);

      // Verificar atualização
      const profile = await buyerCaller.buyer.getProfile();
      expect(profile?.cargo).toBe("CEO");
      expect(profile?.departamento).toBe("Diretoria");
      expect(profile?.interessesTexto).toBe("Agora também preciso de ERP");
    });

    it("Retorna null quando comprador não tem perfil", async () => {
      // Criar caller para usuário sem perfil
      const newBuyerCaller = appRouter.createCaller({
        user: {
          id: 996,
          openId: "new-buyer",
          name: "Novo Comprador",
          email: "novo@test.com",
          role: "cliente",
          partnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });

      const profile = await newBuyerCaller.buyer.getProfile();
      expect(profile).toBeUndefined();
    });

    it("Admin lista todos os compradores", async () => {
      const buyers = await adminCaller.buyer.listAll();
      
      expect(Array.isArray(buyers)).toBe(true);
      expect(buyers.length).toBeGreaterThan(0);
    });

    it("Admin filtra compradores por ecossistema", async () => {
      const buyers = await adminCaller.buyer.listAll({
        ecossistema: "Tecnologia e Comunicação",
      });
      
      expect(Array.isArray(buyers)).toBe(true);
      buyers.forEach((buyer: any) => {
        expect(buyer.ecossistema).toBe("Tecnologia e Comunicação");
      });
    });

    it("Admin filtra compradores por status", async () => {
      const buyers = await adminCaller.buyer.listAll({
        status: "ACTIVE",
      });
      
      expect(Array.isArray(buyers)).toBe(true);
      buyers.forEach((buyer: any) => {
        expect(buyer.status).toBe("ACTIVE");
      });
    });
  });

  describe("Validações e Segurança", () => {
    it("Não permite completar perfil com CNPJ inválido", async () => {
      await expect(
        buyerCaller.buyer.completeProfile({
          cnpj: "123", // CNPJ muito curto
          razaoSocial: "Test",
        })
      ).rejects.toThrow();
    });

    it("Não permite atualizar perfil que não existe", async () => {
      // Criar caller para usuário sem perfil
      const newBuyerCaller = appRouter.createCaller({
        user: {
          id: 995,
          openId: "another-buyer",
          name: "Outro Comprador",
          email: "outro@test.com",
          role: "cliente",
          partnerId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });

      await expect(
        newBuyerCaller.buyer.updateProfile({
          cargo: "CEO",
        })
      ).rejects.toThrow("Perfil de comprador não encontrado");
    });
  });
});
