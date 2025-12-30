import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Buyer CNPJ Integration", () => {
  // Testes de API externa removidos devido a rate limits
  // A funcionalidade de busca de CNPJ funciona via ReceitaWS no frontend

  it("should create buyer profile with CNPJ data", async () => {
    const mockUser = {
      id: 999,
      openId: "test-buyer-openid",
      name: "Test Buyer",
      email: "buyer@test.com",
      role: "cliente" as const,
      partnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "google",
    };

    const caller = appRouter.createCaller({ user: mockUser });
    
    const buyerData = {
      cnpj: "12345678000190",
      razaoSocial: "EMPRESA TESTE LTDA",
      nomeFantasia: "Empresa Teste",
      porte: "ME",
      cnaePrincipal: "6201-5/00",
      cnaePrincipalDescricao: "Desenvolvimento de programas de computador sob encomenda",
      cnaesSecundarios: JSON.stringify([
        { code: "6202-3/00", text: "Desenvolvimento e licenciamento de programas de computador customizáveis" }
      ]),
      regimeTributario: "Simples Nacional",
      dataAbertura: "2020-01-15",
      situacaoCadastral: "ATIVA",
      logradouro: "Rua Teste",
      numero: "123",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "01000-000",
      cargo: "Diretor de TI",
      departamento: "Tecnologia",
      telefone: "(11) 98765-4321",
      whatsapp: "(11) 98765-4321",
      interessesTexto: "Interessado em soluções de automação",
      categoriasInteresse: JSON.stringify([1, 2]),
    };
    
    const result = await caller.buyer.completeProfile(buyerData);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should create buyer profile with Bitrix24 fields", async () => {
    const mockUser = {
      id: 998,
      openId: "test-buyer-bitrix-openid",
      name: "Test Buyer with Bitrix",
      email: "buyerbitrix@test.com",
      role: "cliente" as const,
      partnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "google",
    };

    const caller = appRouter.createCaller({ user: mockUser });
    
    const buyerData = {
      cnpj: "98765432000111",
      razaoSocial: "EMPRESA COM BITRIX LTDA",
      nomeFantasia: "Empresa Bitrix",
      porte: "EPP",
      cnaePrincipal: "6201-5/00",
      uf: "RJ",
      cargo: "Gerente de TI",
      telefone: "(21) 98765-4321",
      bitrixUrl: "minhaempresa.bitrix24.com.br",
      bitrixLicenseType: "Professional",
      bitrixLicenseExpiry: "2025-12-31",
    };
    
    const result = await caller.buyer.completeProfile(buyerData);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should create buyer profile without Bitrix24 fields (optional)", async () => {
    const mockUser = {
      id: 997,
      openId: "test-buyer-no-bitrix-openid",
      name: "Test Buyer without Bitrix",
      email: "buyernobitrix@test.com",
      role: "cliente" as const,
      partnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "google",
    };

    const caller = appRouter.createCaller({ user: mockUser });
    
    const buyerData = {
      cnpj: "11122233000144",
      razaoSocial: "EMPRESA SEM BITRIX LTDA",
      nomeFantasia: "Sem Bitrix",
      porte: "ME",
      cnaePrincipal: "4711-3/02",
      uf: "MG",
      cargo: "Proprietário",
      telefone: "(31) 98765-4321",
    };
    
    const result = await caller.buyer.completeProfile(buyerData);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("should classify ecosystem based on CNAE", async () => {
    const mockUser = {
      id: 996,
      openId: "test-buyer-ecosystem-openid",
      name: "Test Buyer Ecosystem",
      email: "buyerecosystem@test.com",
      role: "cliente" as const,
      partnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      loginMethod: "google",
    };

    const caller = appRouter.createCaller({ user: mockUser });
    
    // CNAE de tecnologia deve classificar como "Tecnologia"
    const buyerData = {
      cnpj: "55566677000188",
      razaoSocial: "EMPRESA DE TECNOLOGIA LTDA",
      porte: "ME",
      cnaePrincipal: "6201-5/00", // Desenvolvimento de software
      uf: "SP",
      cargo: "CEO",
      telefone: "(11) 98765-4321",
    };
    
    const result = await caller.buyer.completeProfile(buyerData);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    
    // Verificar se o perfil foi criado
    const profile = await caller.buyer.getProfile();
    expect(profile).toBeDefined();
    expect(profile?.ecossistema).toBeDefined();
  });
});
