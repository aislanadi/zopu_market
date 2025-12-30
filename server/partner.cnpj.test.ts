import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Partner CNPJ Integration", () => {
  // Testes de API externa removidos devido a rate limits
  // A funcionalidade de busca de CNPJ funciona via BrasilAPI no frontend

  it("should create partner with CNPJ data and Bitrix24 fields", async () => {
    const caller = appRouter.createCaller({ user: null });
    
    const partnerData = {
      companyName: "Empresa Teste LTDA",
      cnpj: "12345678000190",
      razaoSocial: "EMPRESA TESTE LTDA",
      cnae: "6201-5/00",
      cnaeSecundario: "6202-3/00, 6203-1/00",
      uf: "SP",
      contactName: "João Silva",
      contactEmail: "joao@empresateste.com",
      bitrix24Url: "https://empresateste.bitrix24.com.br",
      bitrix24Webhook: "https://empresateste.bitrix24.com.br/rest/1/abc123",
      bitrix24LicenseExpiry: "2025-12-31",
    };
    
    const result = await caller.partner.create(partnerData);
    
    expect(result).toBeDefined();
  });

  it("should create partner without Bitrix24 fields (optional)", async () => {
    const caller = appRouter.createCaller({ user: null });
    
    const partnerData = {
      companyName: "Empresa Sem Bitrix LTDA",
      cnpj: "98765432000111",
      razaoSocial: "EMPRESA SEM BITRIX LTDA",
      cnae: "6201-5/00",
      uf: "RJ",
      contactName: "Maria Santos",
      contactEmail: "maria@sembitrix.com",
    };
    
    const result = await caller.partner.create(partnerData);
    
    expect(result).toBeDefined();
  });
});
