import { describe, it, expect } from "vitest";
import { deletePartner, createAuditLog, getAuditLogs } from "./db";

describe("Partner Delete Functionality", () => {
  it("deve ter função deletePartner disponível", () => {
    expect(typeof deletePartner).toBe("function");
  });

  it("não deve lançar erro ao excluir parceiro inexistente", async () => {
    const nonExistentId = 999999;
    
    // Não deve lançar erro
    await expect(deletePartner(nonExistentId)).resolves.not.toThrow();
  });

  it("deve permitir criar log de auditoria para exclusão de parceiro", async () => {
    const testAuditPartnerId = 88888;
    
    await createAuditLog({
      userId: 1,
      action: "DELETE_PARTNER",
      entityType: "partner",
      entityId: testAuditPartnerId,
      oldValue: JSON.stringify({ 
        id: testAuditPartnerId,
        companyName: "Test Partner",
        contactName: "Test Contact",
        contactEmail: "test@example.com"
      }),
      newValue: null,
    });

    // Verificar que o log foi criado
    const logs = await getAuditLogs({ entityType: "partner", entityId: testAuditPartnerId });
    expect(logs.length).toBeGreaterThan(0);
    
    const deleteLog = logs.find(log => log.action === "DELETE_PARTNER");
    expect(deleteLog).toBeTruthy();
    expect(deleteLog?.action).toBe("DELETE_PARTNER");
    expect(deleteLog?.entityType).toBe("partner");
    expect(deleteLog?.entityId).toBe(testAuditPartnerId);
  });

  it("deve validar estrutura do log de auditoria de exclusão", async () => {
    const testAuditPartnerId = 99999;
    const partnerData = {
      id: testAuditPartnerId,
      companyName: "Parceiro Teste",
      cnpj: "12.345.678/0001-90",
      contactName: "João Silva",
      contactEmail: "joao@teste.com",
      curationStatus: "APPROVED",
      tier: "PREMIUM"
    };
    
    await createAuditLog({
      userId: 1,
      action: "DELETE_PARTNER",
      entityType: "partner",
      entityId: testAuditPartnerId,
      oldValue: JSON.stringify(partnerData),
      newValue: null,
    });

    const logs = await getAuditLogs({ entityType: "partner", entityId: testAuditPartnerId });
    const deleteLog = logs.find(log => log.action === "DELETE_PARTNER");
    
    expect(deleteLog).toBeTruthy();
    expect(deleteLog?.oldValue).toContain("Parceiro Teste");
    expect(deleteLog?.oldValue).toContain("PREMIUM");
    expect(deleteLog?.newValue).toBeNull();
  });
});
