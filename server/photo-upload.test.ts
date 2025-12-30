import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { User } from "../drizzle/schema";

const mockBuyerUser: User = {
  id: 997,
  openId: "test-buyer-photo-openid",
  name: "Buyer Photo Test",
  email: "buyer-photo@test.com",
  loginMethod: "oauth",
  role: "user",
  partnerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("Photo Upload System", () => {
  let buyerCaller: any;

  beforeAll(async () => {
    buyerCaller = appRouter.createCaller({
      user: mockBuyerUser,
    });

    await buyerCaller.buyer.completeProfile({
      cnpj: "12345678000199",
      razaoSocial: "Test Company",
      nomeFantasia: "Test",
      porte: "ME",
      cnaePrincipal: "6201-5/00",
      cnaePrincipalDescricao: "Desenvolvimento de software",
      cnaesSecundarios: "",
      regimeTributario: "Simples Nacional",
      dataAbertura: "2020-01-01",
      situacaoCadastral: "ATIVA",
      ecossistema: "Tecnologia",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "01000-000",
      cargo: "CEO",
      departamento: "Diretoria",
      telefone: "(11) 99999-9999",
      whatsapp: "(11) 99999-9999",
      interessesTexto: "CRM, ERP",
      categoriasInteresse: "1,2",
    });
  });

  it("deve rejeitar upload de imagem muito grande (>5MB)", async () => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const base64Data = largeBuffer.toString('base64');

    await expect(
      buyerCaller.buyer.uploadPhoto({
        fileData: base64Data,
        fileName: "large-image.jpg",
        contentType: "image/jpeg",
      })
    ).rejects.toThrow("Imagem muito grande");
  });

  it("deve rejeitar formato de imagem inválido", async () => {
    const smallBuffer = Buffer.from("fake image data");
    const base64Data = smallBuffer.toString('base64');

    await expect(
      buyerCaller.buyer.uploadPhoto({
        fileData: base64Data,
        fileName: "test.gif",
        contentType: "image/gif",
      })
    ).rejects.toThrow("Formato inválido");
  });

  it("deve aceitar formato JPG e retornar URL", async () => {
    const smallBuffer = Buffer.from("fake jpeg data");
    const base64Data = smallBuffer.toString('base64');

    const result = await buyerCaller.buyer.uploadPhoto({
      fileData: base64Data,
      fileName: "test.jpg",
      contentType: "image/jpeg",
    });

    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
  });

  it("deve atualizar photoUrl no perfil do comprador", async () => {
    const smallBuffer = Buffer.from("fake image for profile");
    const base64Data = smallBuffer.toString('base64');

    const result = await buyerCaller.buyer.uploadPhoto({
      fileData: base64Data,
      fileName: "profile.jpg",
      contentType: "image/jpeg",
    });

    const updatedProfile = await buyerCaller.buyer.getProfile();
    expect(updatedProfile.photoUrl).toBe(result.url);
  });
});
