import { db } from "./server/db.ts";
import { users } from "./drizzle/schema.ts";

// Criar usuário parceiro de teste
const newUser = {
  openId: "test-partner-" + Date.now(),
  name: "Parceiro Teste",
  email: "parceiro@teste.com",
  loginMethod: "oauth",
  role: "parceiro",
  partnerId: 1, // ZOPU Soluções
};

try {
  const result = await db.insert(users).values(newUser);
  console.log("✅ Usuário parceiro criado com sucesso!");
  console.log("\nDados do usuário:");
  console.log("- Nome: Parceiro Teste");
  console.log("- Email: parceiro@teste.com");
  console.log("- Role: parceiro");
  console.log("- Parceiro ID: 1 (ZOPU Soluções)");
  console.log("\n⚠️  IMPORTANTE: Este sistema usa OAuth da Manus.");
  console.log("Para testar como parceiro, você precisará:");
  console.log("1. Usar o Database UI para alterar seu usuário atual");
  console.log("2. Ou implementar um sistema de 'impersonation' para admins");
} catch (error) {
  console.error("❌ Erro ao criar usuário:", error.message);
}

process.exit(0);
