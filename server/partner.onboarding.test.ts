import { describe, it, expect } from "vitest";
import { getPartnerApprovedEmailTemplate, getPartnerRejectedEmailTemplate, sendEmail } from "./_core/email";

describe("Partner Onboarding Functionality", () => {
  describe("Email Templates", () => {
    it("deve gerar template de email de aprovação", () => {
      const template = getPartnerApprovedEmailTemplate({
        partnerName: "João Silva",
        companyName: "Tech Solutions LTDA",
        loginUrl: "https://oauth.manus.im/login",
      });

      expect(template.subject).toContain("aprovado");
      expect(template.html).toContain("João Silva");
      expect(template.html).toContain("Tech Solutions LTDA");
      expect(template.html).toContain("https://oauth.manus.im/login");
      expect(template.text).toContain("João Silva");
      expect(template.text).toContain("Tech Solutions LTDA");
    });

    it("deve gerar template de email de rejeição", () => {
      const template = getPartnerRejectedEmailTemplate({
        partnerName: "Maria Santos",
        companyName: "Consultoria ABC",
      });

      expect(template.subject).toBeTruthy();
      expect(template.html).toContain("Maria Santos");
      expect(template.text).toContain("Maria Santos");
      expect(template.html).toContain("Agradecemos");
    });

    it("deve incluir motivo no template de rejeição quando fornecido", () => {
      const template = getPartnerRejectedEmailTemplate({
        partnerName: "Carlos Oliveira",
        companyName: "Empresa XYZ",
        reason: "Documentação incompleta",
      });

      expect(template.html).toContain("Documentação incompleta");
      expect(template.text).toContain("Documentação incompleta");
    });
  });

  describe("Email Sending", () => {
    it("deve ter função sendEmail disponível", () => {
      expect(typeof sendEmail).toBe("function");
    });

    it("deve aceitar parâmetros corretos de email", async () => {
      const emailOptions = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test Text",
      };

      // Não deve lançar erro
      await expect(sendEmail(emailOptions)).resolves.toBeDefined();
    });
  });

  describe("Template Structure", () => {
    it("template de aprovação deve ter estrutura HTML válida", () => {
      const template = getPartnerApprovedEmailTemplate({
        partnerName: "Test Partner",
        companyName: "Test Company",
        loginUrl: "https://example.com",
      });

      expect(template.html).toContain("<!DOCTYPE html>");
      expect(template.html).toContain("<html>");
      expect(template.html).toContain("</html>");
      expect(template.html).toContain("<body>");
      expect(template.html).toContain("</body>");
    });

    it("template de aprovação deve incluir próximos passos", () => {
      const template = getPartnerApprovedEmailTemplate({
        partnerName: "Test Partner",
        companyName: "Test Company",
        loginUrl: "https://example.com",
      });

      expect(template.html).toContain("Próximos passos");
      expect(template.html).toContain("perfil");
      expect(template.html).toContain("ofertas");
      expect(template.text).toContain("Próximos passos");
    });

    it("template de rejeição deve ser respeitoso e construtivo", () => {
      const template = getPartnerRejectedEmailTemplate({
        partnerName: "Test Partner",
        companyName: "Test Company",
      });

      expect(template.html).toContain("Agradecemos");
      expect(template.html.toLowerCase()).not.toContain("negado");
      expect(template.html.toLowerCase()).not.toContain("recusado");
      expect(template.text).toContain("Agradecemos");
    });
  });

  describe("Email Content Validation", () => {
    it("template de aprovação deve incluir ano atual no footer", () => {
      const template = getPartnerApprovedEmailTemplate({
        partnerName: "Test",
        companyName: "Test Co",
        loginUrl: "https://example.com",
      });

      const currentYear = new Date().getFullYear();
      expect(template.html).toContain(currentYear.toString());
    });

    it("templates devem ter versão text e html", () => {
      const approvedTemplate = getPartnerApprovedEmailTemplate({
        partnerName: "Test",
        companyName: "Test Co",
        loginUrl: "https://example.com",
      });

      expect(approvedTemplate.subject).toBeTruthy();
      expect(approvedTemplate.html).toBeTruthy();
      expect(approvedTemplate.text).toBeTruthy();

      const rejectedTemplate = getPartnerRejectedEmailTemplate({
        partnerName: "Test",
        companyName: "Test Co",
      });

      expect(rejectedTemplate.subject).toBeTruthy();
      expect(rejectedTemplate.html).toBeTruthy();
      expect(rejectedTemplate.text).toBeTruthy();
    });
  });
});
