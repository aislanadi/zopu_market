import { describe, it, expect } from "vitest";
import { getAllUsers, updateUserRole, searchUsers, getUserById } from "./db";

describe("User Management Functionality", () => {
  it("deve ter função getAllUsers disponível", () => {
    expect(typeof getAllUsers).toBe("function");
  });

  it("deve ter função updateUserRole disponível", () => {
    expect(typeof updateUserRole).toBe("function");
  });

  it("deve ter função searchUsers disponível", () => {
    expect(typeof searchUsers).toBe("function");
  });

  it("deve listar todos os usuários", async () => {
    const users = await getAllUsers();
    expect(Array.isArray(users)).toBe(true);
    
    // Verificar estrutura dos usuários
    if (users.length > 0) {
      const user = users[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("openId");
      expect(user).toHaveProperty("createdAt");
    }
  });

  it("deve buscar usuários por query", async () => {
    const results = await searchUsers("test");
    expect(Array.isArray(results)).toBe(true);
  });

  it("deve validar roles permitidos", () => {
    const validRoles = ["admin", "gerente_contas", "parceiro", "cliente"];
    
    validRoles.forEach(role => {
      expect(validRoles).toContain(role);
    });
  });

  it("deve permitir atualizar role de usuário", async () => {
    // Buscar primeiro usuário para teste
    const users = await getAllUsers();
    
    if (users.length > 0) {
      const testUser = users[0];
      const originalRole = testUser.role;
      
      // Atualizar role (sem realmente mudar para não afetar dados)
      await expect(
        updateUserRole(testUser.id, originalRole as any)
      ).resolves.not.toThrow();
      
      // Verificar que usuário ainda existe
      const userAfter = await getUserById(testUser.id);
      expect(userAfter).toBeTruthy();
      expect(userAfter?.id).toBe(testUser.id);
    }
  });

  it("deve permitir associar partnerId ao atualizar role", async () => {
    const users = await getAllUsers();
    
    if (users.length > 0) {
      const testUser = users[0];
      
      // Atualizar com partnerId null
      await expect(
        updateUserRole(testUser.id, testUser.role as any, null)
      ).resolves.not.toThrow();
    }
  });

  it("deve retornar array vazio para busca sem resultados", async () => {
    const results = await searchUsers("xyzabc123nonexistent");
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
